# 📚 Swagger API Documentation Guide

## 🎯 **Complete API Documentation Now Available!**

### 🌐 **Access Swagger UI:**
**http://localhost:3000/api-docs**

---

## 📋 **Available API Endpoints in Swagger**

### **🔐 Authentication Endpoints**
```
POST /api/auth/register      - Register new user
POST /api/auth/login         - User login
GET  /api/auth/profile       - Get user profile
PUT  /api/auth/profile       - Update user profile
```

### **👥 User Management Endpoints**
```
POST /api/users/toggle-role           - Toggle DONOR/RECIPIENT role
GET  /api/users/profile               - Get user profile with role data
PUT  /api/users/profile               - Update user profile
POST /api/users/login-update          - Update last login
GET  /api/users/eligible-donors       - Find eligible donors
GET  /api/users/statistics             - User statistics (Admin)
GET  /api/users                        - Get all users (Admin)
PUT  /api/users/{userId}/approve       - Approve user (Admin)
PUT  /api/users/{userId}/deactivate    - Deactivate user (Super Admin)
GET  /api/users/hospital/{id}/staff    - Hospital staff (Hospital Admin)
```

### **🩸 Donor Endpoints**
```
GET  /api/donors/search               - Search eligible donors
GET  /api/donors/stats                 - Donor statistics
GET  /api/donors/top                   - Top donors by donations
POST /api/donors/eligibility           - Check donation eligibility
POST /api/donors/donations             - Record donation
GET  /api/donors/donations/history     - Donation history
GET  /api/donors/card                  - Donor card information
```

### **🔔 Notification Endpoints**
```
POST /api/notifications/donation-impact  - Send donation impact message
GET  /api/notifications                 - Get user notifications
PUT  /api/notifications/{id}/read        - Mark notification as read
POST /api/notifications/bulk            - Send bulk notifications
GET  /api/notifications/stats            - Notification statistics
```

---

## 🧪 **How to Test with Swagger**

### **1. Authentication Testing**
1. **Register a User:**
   - Go to `POST /api/auth/register`
   - Fill in user details (name, email, password, phone, bloodGroup, age, gender, district)
   - Click "Try it out"

2. **Login and Get Token:**
   - Go to `POST /api/auth/login`
   - Use the email/password you just created
   - Copy the JWT token from response

3. **Authenticate in Swagger:**
   - Click "Authorize" button at top
   - Enter: `Bearer YOUR_JWT_TOKEN`
   - Click "Authorize"

### **2. Test Role Toggle Feature**
1. **Toggle to RECIPIENT:**
   - Go to `POST /api/users/toggle-role`
   - Enter: `{"newRole": "RECIPIENT"}`
   - Click "Try it out"

2. **Check Profile:**
   - Go to `GET /api/users/profile`
   - See your new role and permissions

### **3. Test Donation Impact Notifications**
1. **Send Impact Message:**
   - Go to `POST /api/notifications/donation-impact`
   - Enter: `{"donationId": "test-id", "message": "Your blood saved a life!"}`
   - Click "Try it out"

### **4. Test Donor Search**
1. **Find Eligible Donors:**
   - Go to `GET /api/donors/search`
   - Enter query parameters: `bloodGroup=O_POSITIVE&district=Kathmandu`
   - Click "Try it out"

### **5. Test User Management (Admin)**
1. **Get All Users:**
   - Go to `GET /api/users`
   - Requires Admin role
   - See paginated user list

2. **Get Statistics:**
   - Go to `GET /api/users/statistics`
   - See user role distribution

---

## 🎭 **Testing Different User Roles**

### **Create Different User Types:**

#### **Hospital Admin:**
```json
{
  "name": "Hospital Admin",
  "email": "admin@hospital.com",
  "password": "password123",
  "phone": "9841234568",
  "role": "HOSPITAL_ADMIN",
  "hospitalName": "Teaching Hospital",
  "department": "Blood Bank"
}
```

#### **Blood Bank Staff:**
```json
{
  "name": "Blood Bank Staff",
  "email": "staff@bloodbank.com",
  "password": "password123",
  "phone": "9841234569",
  "role": "BLOOD_BANK_STAFF",
  "hospitalName": "Central Blood Bank"
}
```

#### **Regular Donor:**
```json
{
  "name": "John Doe",
  "email": "donor@example.com",
  "password": "password123",
  "phone": "9841234567",
  "bloodGroup": "O_POSITIVE",
  "age": 25,
  "gender": "MALE",
  "district": "Kathmandu"
}
```

---

## 🔍 **Advanced Testing Scenarios**

### **1. Complete Blood Request Flow:**
1. Register as RECIPIENT
2. Create blood request (when implemented)
3. Search for eligible donors
4. Send donation impact notification

### **2. Hospital Management Flow:**
1. Register as HOSPITAL_ADMIN
2. Get hospital staff list
3. Approve staff members
4. Send bulk notifications to donors

### **3. Donor Journey Flow:**
1. Register as DONOR
2. Check donation eligibility
3. Record donation
4. View donation history
5. Get donor card
6. Toggle to RECIPIENT role

---

## 📊 **Response Examples**

### **Success Response:**
```json
{
  "status": "Success",
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### **Error Response:**
```json
{
  "status": "Error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

---

## 🚀 **Production Testing Tips**

### **1. Use Real Nepal Districts:**
- Kathmandu, Lalitpur, Bhaktapur
- Pokhara, Biratnagar, Nepalgunj
- All 77 districts supported

### **2. Test All Blood Groups:**
- A_POSITIVE, A_NEGATIVE
- B_POSITIVE, B_NEGATIVE  
- AB_POSITIVE, AB_NEGATIVE
- O_POSITIVE, O_NEGATIVE

### **3. Test Role Permissions:**
- DONOR: Can toggle to RECIPIENT
- RECIPIENT: Can toggle to DONOR
- HOSPITAL_ADMIN: Can manage staff and requests
- BLOOD_BANK_STAFF: Can manage inventory
- SUPER_ADMIN: Full system control

---

## 🎯 **Key Features to Test**

✅ **Multi-Role System** - Test all 5 user roles
✅ **Role Toggle** - Switch between DONOR/RECIPIENT
✅ **Donation Impact** - Send life-saving notifications
✅ **Eligibility Check** - Test donation requirements
✅ **Search Functionality** - Find donors by location/blood group
✅ **Statistics** - View system and user statistics
✅ **Authentication** - JWT token-based security
✅ **Validation** - Input validation and error handling

---

## 🌟 **Swagger UI Features**

- **Interactive Testing**: Try all endpoints directly in browser
- **Authentication**: Built-in JWT token handling
- **Parameter Validation**: Auto-generated input forms
- **Response Examples**: See expected response formats
- **Error Handling**: View error responses
- **Export Options**: Download OpenAPI spec for Postman

---

**🎉 Your Raktadan API is now fully documented and ready for comprehensive testing!**

**🌐 Start Testing: http://localhost:3000/api-docs**
