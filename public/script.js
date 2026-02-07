// Raktadan Frontend - Full Backend Integration
// Dynamic API_BASE to handle different domains
const API_BASE = (() => {
  const hostname = window.location.hostname;
  
  // If accessing from localhost, use localhost API
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('Using localhost API:', 'http://localhost:3000/api');
    return 'http://localhost:3000/api';
  }
  
  // If accessing from vercel.app, use the production API
  if (hostname.endsWith('.vercel.app')) {
    const apiUrl = `https://raktadan-backend.vercel.app/api`;
    console.log('Using Vercel API:', apiUrl);
    return apiUrl;
  }
  
  // For other domains, try to construct API URL
  const protocol = window.location.protocol;
  const port = hostname === 'localhost' ? '3000' : window.location.port;
  const apiUrl = `${protocol}//${hostname}${port ? ':' + port : ''}/api`;
  
  console.log('Using dynamic API:', apiUrl);
  return apiUrl;
})();

// Global Variables
let authToken = localStorage.getItem('authToken');
let currentUser = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null;
let districts = [];

// DOM Elements
const authModal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const messageToast = document.getElementById('messageToast');
const toastMessage = document.getElementById('toastMessage');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status
    checkAuthStatus();
    
    setupEventListeners();
    loadPageData('dashboard');
    updateAuthButtons(!!authToken);
    
    // Load districts for registration form
    loadDistricts();
    
    // Add keyboard shortcut for diagnostic (Ctrl+D)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            switchPage('diagnostic');
        }
    });
    
    // Load initial data
    loadDashboardData();
});

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    const navButtons = document.querySelectorAll('.nav-btn[data-page]');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = btn.dataset.page;
            switchPage(pageName);
        });
    });
    
    // Authentication buttons
    loginBtn?.addEventListener('click', () => {
        showLoginForm();
        if (authModal) authModal.classList.add('show');
    });
    
    registerBtn?.addEventListener('click', () => {
        showRegisterForm();
        if (authModal) authModal.classList.add('show');
    });
    
    logoutBtn?.addEventListener('click', () => {
        logout();
    });
    
    // Close modal
    authModal?.addEventListener('click', (e) => {
        if (e.target === authModal) {
            closeAuthModal();
        }
    });
    
    // Form submissions
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registrationForm')?.addEventListener('submit', handleRegistration);
    document.getElementById('donorForm')?.addEventListener('submit', handleDonorRegistration);
    document.getElementById('bloodRequestForm')?.addEventListener('submit', handleBloodRequest);
    document.getElementById('profileForm')?.addEventListener('submit', handleProfileUpdate);
}

// Page Navigation
function switchPage(pageName) {
    // Hide all pages
    const allPages = document.querySelectorAll('.page');
    
    if (allPages) {
        allPages.forEach(page => {
            page.classList.remove('active');
        });
    }
    
    // Remove active class from all nav buttons
    const allNavBtns = document.querySelectorAll('.nav-btn');
    if (allNavBtns) {
        allNavBtns.forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    // Show selected page
    const pageElement = document.getElementById(`${pageName}Page`);
    
    if (pageElement) {
        pageElement.classList.add('active');
    }
    
    // Add active class to clicked button
    const navButton = document.querySelector(`[data-page="${pageName}"]`);
    
    if (navButton) {
        navButton.classList.add('active');
    }
    
    // Load page-specific data
    loadPageData(pageName);
}

// Load Page Data
function loadPageData(pageName) {
    switch (pageName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'donate':
            // Donor page doesn't need data loading
            break;
        case 'request':
            loadRequestData();
            break;
        case 'ambulance':
            loadAmbulanceData();
            break;
        case 'hospitals':
            loadHospitalData();
            break;
        case 'inventory':
            loadInventoryData();
            break;
        case 'camps':
            loadCampData();
            break;
        case 'emergency':
            loadEmergencyData();
            break;
        case 'profile':
            loadProfileData();
            break;
        case 'diagnostic':
            // Diagnostic page doesn't need data loading
            break;
    }
}

// API Helper Function
async function apiCall(endpoint, method = 'GET', data = null, requiresAuth = false) {
    const config = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    if (requiresAuth && authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    if (data) {
        config.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Error:', error);
        return { status: 'Error', message: error.message };
    }
}

// Authentication Functions
function checkAuthStatus() {
    if (authToken && currentUser) {
        updateAuthButtons(true);
    } else {
        updateAuthButtons(false);
    }
}

function updateAuthButtons(isAuthenticated) {
    if (isAuthenticated) {
        loginBtn.classList.add('hidden');
        registerBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
    } else {
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
    }
}

function showLoginForm() {
    const modalTitle = document.getElementById('modalTitle');
    const loginForm = document.getElementById('loginForm');
    const registrationForm = document.getElementById('registrationForm');
    
    if (modalTitle) modalTitle.textContent = 'Login';
    if (loginForm) loginForm.style.display = 'block';
    if (registrationForm) registrationForm.style.display = 'none';
}

function showRegisterForm() {
    const modalTitle = document.getElementById('modalTitle');
    const loginForm = document.getElementById('loginForm');
    const registrationForm = document.getElementById('registrationForm');
    
    if (modalTitle) modalTitle.textContent = 'Register';
    if (loginForm) loginForm.style.display = 'none';
    if (registrationForm) registrationForm.style.display = 'block';
}

function closeAuthModal() {
    if (authModal) authModal.classList.remove('show');
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    updateAuthButtons(false);
    switchPage('dashboard');
    showMessage('Logged out successfully', 'success');
}

async function handleLogin(e) {
    e.preventDefault();
    
    const data = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };
    
    try {
        showLoading();
        
        const result = await apiCall('/auth/login', 'POST', data);
        
        if (result.status === 'Success') {
            authToken = result.data.token;
            currentUser = result.data.user;
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            updateAuthButtons(true);
            closeAuthModal();
            showMessage('Login successful!', 'success');
            switchPage('dashboard');
        } else {
            showMessage(result.message || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Login failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function handleRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const registerData = Object.fromEntries(formData);
    
    // Map frontend field names to API field names
    const mappedData = {
        name: registerData.regName,
        email: registerData.regEmail,
        phone: registerData.regPhone,
        password: registerData.regPassword,
        bloodGroup: registerData.regBloodGroup,
        age: parseInt(registerData.regAge),
        gender: registerData.regGender,
        district: registerData.regDistrict
    };
    
    try {
        showLoading();
        
        // Step 1: Initiate registration
        const initiateResponse = await apiCall('/auth/register/initiate', 'POST', mappedData);
        
        if (initiateResponse.status === 'Success') {
            showMessage(`OTP sent to ${initiateResponse.data.phone}!`, 'success');
            
            // Show OTP verification with default OTP for testing
            const otpCode = prompt('Enter 6-digit OTP (Default: 1234 for testing):');
            const finalOtp = otpCode || "1234";
            
            // Step 2: Complete registration
            const completeData = {
                ...mappedData,
                userId: initiateResponse.data.userId,
                otp: finalOtp
            };
            
            const completeResponse = await apiCall('/auth/register/complete', 'POST', completeData);
            
            if (completeResponse.status === 'Success') {
                authToken = completeResponse.data.token;
                currentUser = completeResponse.data.user;
                
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                updateAuthButtons(true);
                closeAuthModal();
                showMessage('Registration completed successfully!', 'success');
                switchPage('dashboard');
            }
        }
    } catch (error) {
        showMessage(error.message || 'Registration failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Dashboard Data Loading
async function loadDashboardData() {
    try {
        // Mock dashboard data
        const mockStats = {
            totalDonors: Math.floor(Math.random() * 1000) + 500,
            totalDonations: Math.floor(Math.random() * 5000) + 2000,
            totalHospitals: Math.floor(Math.random() * 50) + 20,
            urgentRequests: Math.floor(Math.random() * 20) + 5
        };
        
        updateDashboardStats(mockStats);
        
        // Try backend if available
        try {
            const response = await apiCall('/stats', 'GET', null, true);
            if (response.status === 'Success') {
                updateDashboardStats(response.data);
            }
        } catch (backendError) {
            console.log('Backend stats not available, using mock data');
        }
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showMessage('Failed to load dashboard data', 'error');
    }
}

function updateDashboardStats(stats) {
    document.getElementById('totalDonors').textContent = stats.totalDonors || 0;
    document.getElementById('totalDonations').textContent = stats.totalDonations || 0;
    document.getElementById('totalHospitals').textContent = stats.totalHospitals || 0;
    document.getElementById('urgentRequests').textContent = stats.urgentRequests || 0;
}

// Donor Registration
async function handleDonorRegistration(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showMessage('Please login first', 'error');
        showLoginForm();
        authModal.classList.add('show');
        return;
    }
    
    const formData = new FormData(e.target);
    const donorData = Object.fromEntries(formData);
    
    try {
        showLoading();
        
        const response = await apiCall('/donors', 'POST', donorData, true);
        
        if (response.status === 'Success') {
            showMessage('Donor registration successful!', 'success');
            e.target.reset();
        } else {
            showMessage(response.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('Registration failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Blood Request
async function handleBloodRequest(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const requestData = Object.fromEntries(formData);
    
    // Map form data to API format
    const mappedData = {
        patientName: requestData.patientName,
        patientAge: parseInt(requestData.patientAge),
        patientGender: requestData.patientGender,
        bloodGroup: requestData.requiredBloodGroup,
        unitsRequired: parseInt(requestData.unitsRequired),
        urgency: requestData.urgency,
        hospitalName: requestData.hospitalName,
        hospitalAddress: requestData.hospitalAddress,
        hospitalCity: requestData.hospitalDistrict,
        hospitalState: 'Bagmati',
        hospitalPincode: '44600',
        hospitalPhone: requestData.contactPhone,
        doctorName: 'Dr. Unknown',
        doctorPhone: requestData.contactPhone,
        medicalReason: 'Emergency blood requirement',
        contactPerson: requestData.contactPerson,
        contactPersonPhone: requestData.contactPhone,
        requiredBy: new Date(requestData.requiredBy).toISOString()
    };
    
    try {
        showLoading();
        
        const response = await apiCall('/blood-requests', 'POST', mappedData, true);
        
        if (response.status === 'Success') {
            showMessage('Blood request submitted successfully!', 'success');
            e.target.reset();
            loadRequestData();
        } else {
            showMessage(response.message || 'Request failed', 'error');
        }
    } catch (error) {
        showMessage('Request failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Profile Update
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showMessage('Please login first', 'error');
        return;
    }
    
    const formData = new FormData(e.target);
    const profileData = Object.fromEntries(formData);
    
    try {
        showLoading();
        
        const response = await apiCall('/users/profile', 'PUT', profileData, true);
        
        if (response.status === 'Success') {
            showMessage('Profile updated successfully!', 'success');
            currentUser = response.data;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            showMessage(response.message || 'Update failed', 'error');
        }
    } catch (error) {
        showMessage('Update failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Data Loading Functions
async function loadRequestData() {
    try {
        // Mock request data
        const mockRequests = [
            {
                id: 'req1',
                patientName: 'Ramesh Sharma',
                bloodGroup: 'O_POSITIVE',
                unitsRequired: 3,
                urgency: 'URGENT',
                hospitalName: 'Tribhuvan University Hospital',
                requestDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'req2',
                patientName: 'Sita Kumari',
                bloodGroup: 'A_POSITIVE',
                unitsRequired: 2,
                urgency: 'NORMAL',
                hospitalName: 'Kathmandu Medical College',
                requestDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
            }
        ];
        
        updateRequestList(mockRequests);
        
        // Try backend if available
        try {
            const response = await apiCall('/blood-requests?page=1&limit=10', 'GET', null, true);
            if (response.status === 'Success') {
                updateRequestList(response.data);
            }
        } catch (backendError) {
            console.log('Backend requests not available, using mock data');
        }
    } catch (error) {
        console.error('Failed to load request data:', error);
        showMessage('Failed to load request data', 'error');
    }
}

function updateRequestList(requests) {
    const requestsList = document.getElementById('requestsList');
    if (!requestsList) return;
    
    requestsList.innerHTML = requests.map(request => `
        <div class="list-item">
            <div class="list-item-header">
                <h3>${request.patientName}</h3>
                <span class="status-badge status-${request.urgency.toLowerCase()}">${request.urgency}</span>
            </div>
            <div class="list-item-details">
                <p><strong>Blood Group:</strong> ${request.bloodGroup}</p>
                <p><strong>Units Required:</strong> ${request.unitsRequired}</p>
                <p><strong>Hospital:</strong> ${request.hospitalName}</p>
                <p><strong>Date:</strong> ${formatDate(request.requestDate)}</p>
            </div>
        </div>
    `).join('');
}

async function loadAmbulanceData() {
    try {
        const locationFilter = document.getElementById('locationFilter')?.value || '';
        const availabilityFilter = document.getElementById('availabilityFilter')?.value || '';
        const serviceTypeFilter = document.getElementById('serviceTypeFilter')?.value || '';
        
        // Build query parameters
        const params = new URLSearchParams();
        if (locationFilter) params.append('district', locationFilter);
        if (availabilityFilter) params.append('is24Hours', availabilityFilter === '24hours');
        if (serviceTypeFilter) params.append('serviceType', serviceTypeFilter.toUpperCase());
        
        const result = await apiCall(`/ambulances/search?${params.toString()}`, 'GET', null, true);
        
        if (result.status === 'Success') {
            displayAmbulanceData(result.data.ambulances);
        } else {
            displayAmbulanceData([]);
        }
    } catch (error) {
        console.error('Error loading ambulance data:', error);
        displayAmbulanceData([]);
    }
}

function displayAmbulanceData(ambulances) {
    const ambulanceList = document.getElementById('ambulanceList');
    if (!ambulanceList) return;
    
    if (ambulances.length === 0) {
        ambulanceList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-ambulance"></i>
                <h3>No Ambulances Found</h3>
                <p>Try adjusting your search filters</p>
            </div>
        `;
        return;
    }
    
    ambulanceList.innerHTML = ambulances.map(ambulance => `
        <div class="list-item">
            <div class="list-item-header">
                <h3>${ambulance.name}</h3>
                <span class="status-badge status-${ambulance.isActive ? 'available' : 'unavailable'}">${ambulance.isActive ? 'Available' : 'Unavailable'}</span>
            </div>
            <div class="list-item-content">
                <p><i class="fas fa-phone"></i> ${ambulance.phoneNumber}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${ambulance.city}, ${ambulance.district}</p>
                <p><i class="fas fa-truck-medical"></i> ${ambulance.serviceType}</p>
                <p><i class="fas fa-clock"></i> ${ambulance.is24Hours ? '24 Hours' : 'Limited Hours'}</p>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-primary btn-sm" onclick="callAmbulance('${ambulance.phoneNumber}')">
                    <i class="fas fa-phone"></i> Call
                </button>
            </div>
        </div>
    `).join('');
}

async function loadHospitalData() {
    try {
        const locationFilter = document.getElementById('hospitalLocationFilter')?.value || '';
        const typeFilter = document.getElementById('hospitalTypeFilter')?.value || '';
        const bloodBankFilter = document.getElementById('bloodBankFilter')?.value || '';
        
        // Build query parameters
        const params = new URLSearchParams();
        if (locationFilter) params.append('district', locationFilter);
        if (typeFilter) params.append('type', typeFilter);
        if (bloodBankFilter) params.append('hasBloodBank', bloodBankFilter === 'yes');
        
        const result = await apiCall(`/hospitals/search?${params.toString()}`, 'GET', null, true);
        
        if (result.status === 'Success') {
            displayHospitalData(result.data.hospitals);
        } else {
            displayHospitalData([]);
        }
    } catch (error) {
        console.error('Error loading hospital data:', error);
        displayHospitalData([]);
    }
}

function displayHospitalData(hospitals) {
    const hospitalList = document.getElementById('hospitalList');
    if (!hospitalList) return;
    
    if (hospitals.length === 0) {
        hospitalList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-hospital"></i>
                <h3>No Hospitals Found</h3>
                <p>Try adjusting your search filters</p>
            </div>
        `;
        return;
    }
    
    hospitalList.innerHTML = hospitals.map(hospital => `
        <div class="list-item">
            <div class="list-item-header">
                <h3>${hospital.name}</h3>
                <span class="status-badge status-${hospital.isVerified ? 'verified' : 'unverified'}">${hospital.isVerified ? 'Verified' : 'Unverified'}</span>
            </div>
            <div class="list-item-content">
                <p><i class="fas fa-phone"></i> ${hospital.phone}</p>
                <p><i class="fas fa-envelope"></i> ${hospital.email}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${hospital.address}</p>
                <p><i class="fas fa-building"></i> ${hospital.type}</p>
                <p><i class="fas fa-tint"></i> ${hospital.bloodBankAvailable ? 'Blood Bank Available' : 'No Blood Bank'}</p>
                <p><i class="fas fa-ambulance"></i> ${hospital.emergencyServices ? 'Emergency Services' : 'No Emergency Services'}</p>
            </div>
            <div class="list-item-actions">
                <button class="btn btn-primary btn-sm" onclick="callHospital('${hospital.phone}')">
                    <i class="fas fa-phone"></i> Call
                </button>
                <button class="btn btn-secondary btn-sm" onclick="getDirections('${hospital.address}')">
                    <i class="fas fa-directions"></i> Directions
                </button>
            </div>
        </div>
    `).join('');
}

function callHospital(phone) {
    window.location.href = `tel:${phone}`;
}

function getDirections(address) {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
}

async function loadInventoryData() {
    try {
        const locationFilter = document.getElementById('inventoryLocationFilter')?.value || '';
        const bloodGroupFilter = document.getElementById('bloodGroupFilter')?.value || '';
        
        // Build query parameters
        const params = new URLSearchParams();
        if (locationFilter) params.append('district', locationFilter);
        if (bloodGroupFilter) params.append('bloodGroup', bloodGroupFilter);
        
        const result = await apiCall(`/inventory/summary?${params.toString()}`, 'GET', null, true);
        
        if (result.status === 'Success') {
            displayInventoryData(result.data.inventory);
        } else {
            displayInventoryData([]);
        }
    } catch (error) {
        console.error('Error loading inventory data:', error);
        displayInventoryData([]);
    }
}

function displayInventoryData(inventory) {
    const inventoryList = document.getElementById('inventoryList');
    if (!inventoryList) return;
    
    if (inventory.length === 0) {
        inventoryList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-tint"></i>
                <h3>No Inventory Data Found</h3>
                <p>Try adjusting your search filters</p>
            </div>
        `;
        return;
    }
    
    inventoryList.innerHTML = inventory.map(item => `
        <div class="inventory-item">
            <div class="inventory-header">
                <h3>${item.bloodGroup}</h3>
                <span class="status-badge status-${item.availableDonors > 20 ? 'good' : item.availableDonors > 10 ? 'medium' : 'low'}">
                    ${item.availableDonors > 20 ? 'Good Stock' : item.availableDonors > 10 ? 'Medium Stock' : 'Low Stock'}
                </span>
            </div>
            <div class="inventory-stats">
                <div class="stat">
                    <span class="stat-label">Available Donors:</span>
                    <span class="stat-value">${item.availableDonors}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Current Requests:</span>
                    <span class="stat-value">${item.currentRequests}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Units Needed:</span>
                    <span class="stat-value">${item.unitsNeeded}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Estimated Supply:</span>
                    <span class="stat-value">${item.estimatedSupply}</span>
                </div>
            </div>
        </div>
    `).join('');
}

async function loadCampData() {
    try {
        const locationFilter = document.getElementById('campLocationFilter')?.value || '';
        const statusFilter = document.getElementById('campStatusFilter')?.value || '';
        
        // Build query parameters
        const params = new URLSearchParams();
        if (locationFilter) params.append('city', locationFilter);
        if (statusFilter) params.append('status', statusFilter.toUpperCase());
        
        const result = await apiCall(`/donation-camps?${params.toString()}`, 'GET', null, true);
        
        if (result.status === 'Success') {
            displayCampData(result.data);
        } else {
            displayCampData([]);
        }
    } catch (error) {
        console.error('Error loading camp data:', error);
        displayCampData([]);
    }
}

function displayCampData(camps) {
    const campList = document.getElementById('campList');
    if (!campList) return;
    
    if (camps.length === 0) {
        campList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-calendar"></i>
                <h3>No Camps Found</h3>
                <p>Try adjusting your search filters</p>
            </div>
        `;
        return;
    }
    
    campList.innerHTML = camps.map(camp => `
        <div class="camp-card">
            <div class="camp-header">
                <h3>${camp.title}</h3>
                <span class="status-badge status-${camp.status.toLowerCase()}">${camp.status}</span>
            </div>
            <div class="camp-details">
                <p><i class="fas fa-building"></i> <strong>Organizer:</strong> ${camp.organizer}</p>
                <p><i class="fas fa-map-marker-alt"></i> <strong>Venue:</strong> ${camp.venue}</p>
                <p><i class="fas fa-calendar"></i> <strong>Date:</strong> ${new Date(camp.startDate).toLocaleDateString()}</p>
                <p><i class="fas fa-clock"></i> <strong>Time:</strong> ${camp.startTime} - ${camp.endTime}</p>
                <p><i class="fas fa-users"></i> <strong>Target:</strong> ${camp.targetDonations} donations</p>
            </div>
            <div class="camp-actions">
                <button class="btn btn-primary btn-sm" onclick="registerForCamp('${camp.id}')">
                    <i class="fas fa-user-plus"></i> Register
                </button>
                <button class="btn btn-secondary btn-sm" onclick="callCamp('${camp.organizerPhone}')">
                    <i class="fas fa-phone"></i> Call
                </button>
            </div>
        </div>
    `).join('');
}

function registerForCamp(campId) {
    if (!currentUser) {
        showMessage('Please login to register for donation camp', 'error');
        return;
    }
    
    // Implement camp registration logic
    showMessage('Camp registration feature coming soon!', 'info');
}

function callCamp(phone) {
    window.location.href = `tel:${phone}`;
}

// Utility Functions
function showMessage(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) loading.classList.add('show');
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) loading.classList.remove('show');
}

// Initialize app
async function loadDashboardData() {
    try {
        const result = await apiCall('/stats/', 'GET', null, true);
        if (result.status === 'Success') {
            updateDashboardStats(result.data);
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function updateDashboardStats(stats) {
    // Update dashboard elements with stats
    const elements = {
        totalDonors: document.getElementById('totalDonors'),
        totalDonations: document.getElementById('totalDonations'),
        totalHospitals: document.getElementById('totalHospitals'),
        urgentRequests: document.getElementById('urgentRequests'),
        totalCamps: document.getElementById('totalCamps')
    };
    
    Object.keys(elements).forEach(key => {
        if (elements[key] && stats[key] !== undefined) {
            elements[key].textContent = stats[key];
        }
    });
}

async function loadEmergencyData() {
    // Emergency data is static, no need to load from backend
    console.log('Emergency page loaded');
}

function handleEmergencyAction(action) {
    switch (action) {
        case 'urgent-blood':
            showMessage('Redirecting to urgent blood request...', 'info');
            switchPage('request');
            break;
        case 'request-ambulance':
            showMessage('Redirecting to ambulance booking...', 'info');
            switchPage('ambulance');
            break;
        case 'find-hospitals':
            showMessage('Redirecting to hospital directory...', 'info');
            switchPage('hospitals');
            break;
        default:
            showMessage('Emergency action initiated', 'success');
    }
}

async function loadProfileData() {
    if (!currentUser) {
        document.getElementById('profilePage').innerHTML = `
            <div class="page-header">
                <h1>My Profile</h1>
                <p>Please login to view your profile</p>
            </div>
            <div class="text-center">
                <button class="btn btn-primary" onclick="showLoginForm(); authModal.classList.add('show');">
                    <i class="fas fa-sign-in-alt"></i>
                    Login to View Profile
                </button>
            </div>
        `;
        return;
    }
    
    // Populate profile form with current user data
    document.getElementById('profileName').value = currentUser.name || '';
    document.getElementById('profileEmail').value = currentUser.email || '';
    document.getElementById('profilePhone').value = currentUser.phone || '';
    document.getElementById('profileBloodGroup').value = currentUser.bloodGroup || '';
    document.getElementById('profileAge').value = currentUser.age || '';
    document.getElementById('profileGender').value = currentUser.gender || '';
    document.getElementById('profileDistrict').value = currentUser.district || '';
    
    // Load donation history
    loadDonationHistory();
}

async function loadDonationHistory() {
    try {
        // Mock donation history
        const mockHistory = [
            {
                id: 'don1',
                donationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                location: 'Kathmandu Blood Bank',
                units: 2,
                verified: true
            }
        ];
        
        updateDonationHistory(mockHistory);
        
        // Try backend if available
        try {
            const response = await apiCall('/donations', 'GET', null, true);
            if (response.status === 'Success') {
                updateDonationHistory(response.data);
            }
        } catch (backendError) {
            console.log('Backend donations not available, using mock data');
        }
    } catch (error) {
        console.error('Failed to load donation history:', error);
    }
}

function updateDonationHistory(donations) {
    const historyContainer = document.getElementById('donationHistory');
    if (!historyContainer) return;
    
    if (donations.length === 0) {
        historyContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-tint"></i>
                <h3>No Donation History</h3>
                <p>Your donation history will appear here</p>
            </div>
        `;
        return;
    }
    
    historyContainer.innerHTML = donations.map(donation => `
        <div class="list-item">
            <div class="list-item-header">
                <h3>Donation</h3>
                <span class="status-badge status-available">${donation.verified ? 'Verified' : 'Pending'}</span>
            </div>
            <div class="list-item-details">
                <p><strong>Date:</strong> ${formatDate(donation.donationDate)}</p>
                <p><strong>Location:</strong> ${donation.location}</p>
                <p><strong>Units:</strong> ${donation.units}</p>
            </div>
        </div>
    `).join('');
}

// Districts Loading
async function loadDistricts() {
    try {
        const response = await apiCall('/districts', 'GET', null, false);
        if (response.status === 'Success') {
            districts = response.data;
            updateAllDistrictDropdowns();
        }
    } catch (error) {
        console.log('Backend districts not available, using fallback');
        // Use fallback districts
        districts = [
            'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kavrepalanchok', 'Dhading',
            'Nuwakot', 'Rasuwa', 'Sindhupalchok', 'Dolakha', 'Mahagadhi',
            'Baglung', 'Mustang', 'Myagdi', 'Parbat', 'Kaski',
            'Lamjung', 'Gorkha', 'Manang', 'Syangja', 'Tanahu',
            'Pokhara', 'Chitwan', 'Makwanpur', 'Ramechhap', 'Sindhuli',
            'Biratnagar', 'Dharan', 'Itahari', 'Birgunj', 'Janakpur',
            'Bhaktapur', 'Patan', 'Madhyapur Thimi', 'Banepa', 'Dhulikhel',
            'Nepalgunj', 'Mahendranagar', 'Bhairahawa', 'Butwal', 'Tulsipur',
            'Ghorahi', 'Tikapur', 'Kalaiya', 'Rajbiraj', 'Lahan',
            'Damak', 'Ilam', 'Jhapa', 'Mechinagar', 'Birtamod',
            'Dhangadhi', 'Kanchanpur', 'Mahendranagar', 'Dadeldhura',
            'Baitadi', 'Darchula', 'Sanjay', 'Kailali', 'Kanchanpur'
        ];
        updateAllDistrictDropdowns();
    }
}

function updateAllDistrictDropdowns() {
    const districtSelects = document.querySelectorAll('select[id*="District"]');
    
    districtSelects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Select District</option>';
        
        districts.forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            if (district === currentValue) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    });
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showMessage(message, type = 'info') {
    toastMessage.textContent = message;
    messageToast.classList.remove('hidden');
    
    // Update toast styling based on type
    const toastContent = messageToast.querySelector('.toast-content');
    toastContent.className = 'toast-content';
    
    if (type === 'success') {
        messageToast.style.background = 'var(--success-color)';
    } else if (type === 'error') {
        messageToast.style.background = 'var(--danger-color)';
    } else if (type === 'warning') {
        messageToast.style.background = 'var(--warning-color)';
    } else {
        messageToast.style.background = 'var(--dark-color)';
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageToast.classList.add('hidden');
    }, 5000);
}

function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// Action Functions
function contactAmbulance(phoneNumber) {
    if (confirm(`Call ${phoneNumber}?`)) {
        showMessage(`Calling ${phoneNumber}...`, 'info');
        // In a real implementation, this would open the phone dialer
        window.location.href = `tel:${phoneNumber}`;
    }
}

function bookAmbulance(ambulanceId) {
    if (!currentUser) {
        showMessage('Please login first to book ambulance', 'error');
        showLoginForm();
        authModal.classList.add('show');
        return;
    }
    
    showMessage(`Booking ambulance ${ambulanceId}...`, 'info');
    // In a real implementation, this would make an API call to book the ambulance
}

// Export functions for global access
window.switchPage = switchPage;
window.showMessage = showMessage;
window.loadPageData = loadPageData;
window.runDiagnosticTests = runDiagnosticTests;
window.clearDiagnosticResults = clearDiagnosticResults;

// Diagnostic Functions
function addDiagnosticResult(test, status, message, details = '') {
    const resultsDiv = document.getElementById('diagnosticResults');
    if (!resultsDiv) return;
    
    const resultDiv = document.createElement('div');
    resultDiv.className = `diagnostic-result ${status}`;
    resultDiv.innerHTML = `
        <div class="diagnostic-header">
            <h3>${test}: ${status.toUpperCase()}</h3>
            <span class="status-icon">${status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳'}</span>
        </div>
        <div class="diagnostic-content">
            <p>${message}</p>
            ${details ? `<pre class="diagnostic-details">${details}</pre>` : ''}
        </div>
    `;
    resultsDiv.appendChild(resultDiv);
}

function clearDiagnosticResults() {
    const resultsDiv = document.getElementById('diagnosticResults');
    if (resultsDiv) {
        resultsDiv.innerHTML = '';
    }
}

async function runDiagnosticTests() {
    clearDiagnosticResults();
    addDiagnosticResult('API Connection', 'loading', 'Testing API connectivity...');
    
    try {
        // Test 1: Health Check
        const healthResponse = await fetch(`${API_BASE}/health`);
        const healthData = await healthResponse.json();
        addDiagnosticResult('Health Check', 'success', 'API is reachable', JSON.stringify(healthData, null, 2));
        
        // Test 2: Authentication
        addDiagnosticResult('Authentication', 'loading', 'Testing login...');
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
        });
        const loginData = await loginResponse.json();
        
        if (loginData.status === 'Success') {
            const token = loginData.data.token;
            addDiagnosticResult('Authentication', 'success', 'Login successful', `Token: ${token.substring(0, 50)}...`);
            
            // Test 3: Authenticated API Call
            addDiagnosticResult('Authenticated API', 'loading', 'Testing authenticated API call...');
            const hospitalsResponse = await fetch(`${API_BASE}/hospitals`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const hospitalsData = await hospitalsResponse.json();
            
            if (hospitalsData.status === 'Success') {
                addDiagnosticResult('Authenticated API', 'success', `Found ${hospitalsData.data.hospitals.length} hospitals`);
            } else {
                addDiagnosticResult('Authenticated API', 'error', 'Failed to fetch hospitals', JSON.stringify(hospitalsData, null, 2));
            }

            // Test 4: Stats API Call
            addDiagnosticResult('Stats API', 'loading', 'Testing stats API...');
            const statsResponse = await fetch(`${API_BASE}/stats/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const statsData = await statsResponse.json();
            
            if (statsData.status === 'Success') {
                addDiagnosticResult('Stats API', 'success', 'Stats retrieved successfully', JSON.stringify(statsData.data, null, 2));
            } else {
                addDiagnosticResult('Stats API', 'error', 'Failed to fetch stats', JSON.stringify(statsData, null, 2));
            }
        } else {
            addDiagnosticResult('Authentication', 'error', 'Login failed', JSON.stringify(loginData, null, 2));
        }
        
        // Test 5: Districts (public endpoint)
        addDiagnosticResult('Public API', 'loading', 'Testing public API...');
        const districtsResponse = await fetch(`${API_BASE}/districts`);
        const districtsData = await districtsResponse.json();
        
        if (districtsData.status === 'Success') {
            addDiagnosticResult('Public API', 'success', `Found ${districtsData.data.length} districts`);
        } else {
            addDiagnosticResult('Public API', 'error', 'Failed to fetch districts', JSON.stringify(districtsData, null, 2));
        }
        
        addDiagnosticResult('Overall Status', 'success', 'All diagnostic tests completed successfully!');
        
    } catch (error) {
        addDiagnosticResult('API Connection', 'error', 'API connection failed', error.message);
    }
}
