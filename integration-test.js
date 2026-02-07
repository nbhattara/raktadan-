const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

let authToken = '';

// Test functions
async function testBackendHealth() {
  try {
    const response = await axios.get(`${API_BASE}/health`);
    console.log('✅ Backend Health Check:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend Health Check Failed:', error.message);
    return false;
  }
}

async function testAuthentication() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    authToken = response.data.data.token;
    console.log('✅ Authentication Successful');
    return true;
  } catch (error) {
    console.error('❌ Authentication Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testDistricts() {
  try {
    const response = await axios.get(`${API_BASE}/districts`);
    console.log('✅ Districts API:', response.data.data.length, 'districts loaded');
    return true;
  } catch (error) {
    console.error('❌ Districts API Failed:', error.message);
    return false;
  }
}

async function testHospitals() {
  try {
    const response = await axios.get(`${API_BASE}/hospitals`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Hospitals API:', response.data.data.hospitals.length, 'hospitals loaded');
    return true;
  } catch (error) {
    console.error('❌ Hospitals API Failed:', error.message);
    return false;
  }
}

async function testAmbulances() {
  try {
    const response = await axios.get(`${API_BASE}/ambulances`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Ambulances API:', response.data.data.ambulances.length, 'ambulances loaded');
    return true;
  } catch (error) {
    console.error('❌ Ambulances API Failed:', error.message);
    return false;
  }
}

async function testDonationCamps() {
  try {
    const response = await axios.get(`${API_BASE}/donation-camps`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Donation Camps API:', response.data.data.length, 'camps loaded');
    return true;
  } catch (error) {
    console.error('❌ Donation Camps API Failed:', error.message);
    return false;
  }
}

async function testStats() {
  try {
    const response = await axios.get(`${API_BASE}/stats/`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Stats API:', response.data.data);
    return true;
  } catch (error) {
    console.error('❌ Stats API Failed:', error.message);
    return false;
  }
}

async function testBloodRequests() {
  try {
    const response = await axios.get(`${API_BASE}/blood-requests`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Blood Requests API:', response.data.data.length, 'requests loaded');
    return true;
  } catch (error) {
    console.error('❌ Blood Requests API Failed:', error.message);
    return false;
  }
}

async function testInventory() {
  try {
    const response = await axios.get(`${API_BASE}/inventory`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Inventory API:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Inventory API Failed:', error.message);
    return false;
  }
}

// Run all tests
async function runIntegrationTests() {
  console.log('🚀 Starting Backend-Frontend Integration Tests...\n');
  
  const tests = [
    { name: 'Backend Health', fn: testBackendHealth },
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Districts', fn: testDistricts },
    { name: 'Hospitals', fn: testHospitals },
    { name: 'Ambulances', fn: testAmbulances },
    { name: 'Donation Camps', fn: testDonationCamps },
    { name: 'Stats', fn: testStats },
    { name: 'Blood Requests', fn: testBloodRequests },
    { name: 'Inventory', fn: testInventory }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n🧪 Testing ${test.name}...`);
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}/${tests.length}`);
  console.log(`❌ Failed: ${failed}/${tests.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Backend-Frontend integration is working perfectly!');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run tests
runIntegrationTests().catch(console.error);
