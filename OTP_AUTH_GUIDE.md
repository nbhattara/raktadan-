# 🔐 **OTP-Based Authentication System Implementation**

## 🎯 **New Authentication Flow**

### **📋 Registration Process (2-Step)**

#### **Step 1: Initiate Registration**
```http
POST /api/auth/register/initiate
```

**Request Body:**
```json
{
  "name": "Ram Bahadur",
  "email": "ram@example.com",
  "password": "password123",
  "phone": "9841234567",
  "bloodGroup": "O_POSITIVE",
  "age": 25,
  "gender": "MALE",
  "district": "Kathmandu"
}
```

**Response:**
```json
{
  "status": "Success",
  "message": "OTP sent to your email. Please verify to complete registration.",
  "data": {
    "userId": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
    "email": "ram@example.com",
    "message": "Please check your email for the OTP"
  }
}
```

#### **Step 2: Complete Registration with OTP**
```http
POST /api/auth/register/complete
```

**Request Body:**
```json
{
  "userId": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "otp": "123456",
  "name": "Ram Bahadur",
  "email": "ram@example.com",
  "password": "password123",
  "phone": "9841234567",
  "bloodGroup": "O_POSITIVE",
  "age": 25,
  "gender": "MALE",
  "district": "Kathmandu"
}
```

**Response:**
```json
{
  "status": "Success",
  "message": "Registration completed successfully",
  "data": {
    "user": {
      "id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
      "name": "Ram Bahadur",
      "email": "ram@example.com",
      "phone": "9841234567",
      "bloodGroup": "O_POSITIVE",
      "role": "DONOR",
      "isEmailVerified": true,
      "isOtpEnabled": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "otpSecret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

---

### **🔑 Simplified Login Process**

#### **Basic Login (No 2FA)**
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "userId": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "Success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
      "name": "Ram Bahadur",
      "email": "ram@example.com",
      "role": "DONOR",
      "isOtpEnabled": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "isOtpEnabled": false
  }
}
```

#### **Login with 2FA Required**
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "userId": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "password": "password123"
}
```

**Response (2FA Required):**
```json
{
  "status": "Success",
  "message": "2FA required. Please enter your TOTP code.",
  "requires2FA": true
}
```

**Request Body (with TOTP):**
```json
{
  "userId": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "password": "password123",
  "totpCode": "123456"
}
```

**Response (Success with 2FA):**
```json
{
  "status": "Success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
      "name": "Ram Bahadur",
      "email": "ram@example.com",
      "role": "DONOR",
      "isOtpEnabled": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "isOtpEnabled": true
  }
}
```

---

## 🛡️ **Two-Factor Authentication (2FA)**

### **Get 2FA Setup Information**
```http
GET /api/auth/2fa/setup
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "status": "Success",
  "message": "2FA setup information",
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "isOtpEnabled": false,
    "instructions": [
      "1. Scan the QR code with Google Authenticator or similar app",
      "2. Enter the 6-digit code to enable 2FA",
      "3. Keep your backup secret safe"
    ]
  }
}
```

### **Enable 2FA**
```http
POST /api/auth/2fa/enable
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "totpCode": "123456"
}
```

**Response:**
```json
{
  "status": "Success",
  "message": "2FA enabled successfully"
}
```

### **Disable 2FA**
```http
POST /api/auth/2fa/disable
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "Success",
  "message": "2FA disabled successfully"
}
```

---

## 🔧 **Technical Implementation Details**

### **📱 OTP Service Features**
- **Email OTP**: 6-digit code sent via email
- **TOTP Support**: Time-based One-Time Password (Google Authenticator)
- **Expiry**: 10 minutes for email OTP
- **Max Attempts**: 3 attempts per OTP
- **Auto Cleanup**: Automatic cleanup of expired OTPs

### **🔐 Security Features**
- **User ID Generation**: SHA-256 hash of email (16 characters)
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure authentication tokens
- **Rate Limiting**: Built-in attempt limiting
- **Input Validation**: Comprehensive Joi validation

### **🗄️ Database Schema Updates**
```sql
-- Added to User model:
otpSecret       String?    -- TOTP secret for 2FA
isOtpEnabled   Boolean   -- Whether 2FA is enabled
registrationOtp String?    -- OTP for email verification
otpExpiresAt   DateTime? -- OTP expiration time
```

---

## 🧪 **Testing the New System**

### **1. Test Registration Flow**
```bash
# Step 1: Initiate registration
curl -X POST http://localhost:3000/api/auth/register/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "9841234567",
    "bloodGroup": "O_POSITIVE",
    "age": 25,
    "gender": "MALE",
    "district": "Kathmandu"
  }'

# Step 2: Complete registration (check console for OTP)
curl -X POST http://localhost:3000/api/auth/register/complete \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "otp": "123456",
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "9841234567",
    "bloodGroup": "O_POSITIVE",
    "age": 25,
    "gender": "MALE",
    "district": "Kathmandu"
  }'
```

### **2. Test Login Flow**
```bash
# Basic login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "password": "password123"
  }'

# Login with 2FA (if enabled)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "password": "password123",
    "totpCode": "123456"
  }'
```

### **3. Test 2FA Setup**
```bash
# Get QR code
curl -X GET http://localhost:3000/api/auth/2fa/setup \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Enable 2FA
curl -X POST http://localhost:3000/api/auth/2fa/enable \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"totpCode": "123456"}'
```

---

## 📱 **Mobile App Integration**

### **🔐 Authenticator Apps Support**
- **Google Authenticator**
- **Microsoft Authenticator**
- **Authy**
- **1Password**
- **LastPass Authenticator**

### **📲 QR Code Setup**
1. **Get QR Code**: Call `/api/auth/2fa/setup`
2. **Scan QR Code**: Use any authenticator app
3. **Enable 2FA**: Call `/api/auth/2fa/enable` with TOTP code
4. **Login**: Use TOTP code for future logins

---

## 🔍 **Swagger Documentation**

### **📚 Updated Endpoints**
All new authentication endpoints are fully documented in Swagger:

- **POST** `/api/auth/register/initiate` - Initiate registration
- **POST** `/api/auth/register/complete` - Complete registration with OTP
- **POST** `/api/auth/login` - Simplified login with user ID
- **GET** `/api/auth/2fa/setup` - Get 2FA setup information
- **POST** `/api/auth/2fa/enable` - Enable 2FA
- **POST** `/api/auth/2fa/disable` - Disable 2FA

### **🌐 Access Swagger UI**
**http://localhost:3000/api-docs**

---

## 🎯 **Benefits of New System**

### **✅ Enhanced Security**
- **Email Verification**: Prevents fake registrations
- **2FA Support**: Optional TOTP-based authentication
- **User ID System**: Simplified login with unique IDs
- **Rate Limiting**: Protection against brute force attacks

### **✅ Better User Experience**
- **2-Step Registration**: Clear verification process
- **Simplified Login**: Only user ID and password required
- **Optional 2FA**: Users can choose security level
- **QR Code Setup**: Easy mobile app integration

### **✅ Developer Friendly**
- **Comprehensive Validation**: Joi-based input validation
- **Clear Error Messages**: Detailed error responses
- **Swagger Documentation**: Complete API documentation
- **Modular Design**: Easy to extend and maintain

---

## 🚀 **Migration Guide**

### **For Existing Users:**
1. **Current users** can continue using email/password login
2. **Optional 2FA**: Users can enable 2FA anytime
3. **User ID**: Existing users get user ID automatically
4. **Backward Compatibility**: Old login methods still supported

### **For New Users:**
1. **Email OTP**: Must verify email during registration
2. **User ID**: Get unique ID after registration
3. **2FA Optional**: Can enable 2FA after registration
4. **Mobile Ready**: QR code setup for authenticator apps

---

**🎉 YOUR RAKTADAN API NOW HAS MODERN OTP-BASED AUTHENTICATION! 🎉**

**Features: Email verification, 2FA support, simplified login, and comprehensive security!**
