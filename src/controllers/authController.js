const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const config = require('../config');
const otpService = require('../services/otpService');

const prisma = new PrismaClient();

const generateToken = (userId) => {
  return jwt.sign({ userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE
  });
};

// Step 1: Initiate registration with email
const initiateRegistration = async (req, res, next) => {
  try {
    const { email, name, phone, password, bloodGroup, age, gender, district } = req.body;

    // Convert age to integer
    const ageInt = parseInt(age);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'Error',
        message: existingUser.email === email ? 'Email already registered' : 'Phone number already registered'
      });
    }

    // Generate user ID and OTP
    const userId = otpService.generateUserId(email);
    const otp = otpService.generateOTP(userId, email, phone);

    // Send OTP to phone number (primary) and email (backup)
    const otpResult = await otpService.sendOTP(email, phone, otp, 'registration');

    // Store temporary registration data (in production, use Redis)
    // For now, we'll create a pending user record
    const hashedPassword = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

    res.status(200).json({
      status: 'Success',
      message: `OTP sent to your phone number ${phone}. Please verify to complete registration.`,
      data: {
        userId,
        phone,
        email,
        method: otpResult.method,
        message: `Please check your ${otpResult.method} for the OTP`
      }
    });

  } catch (error) {
    next(error);
  }
};

// Step 2: Complete registration with OTP verification
const completeRegistration = async (req, res, next) => {
  try {
    const { userId, otp, name, phone, password, bloodGroup, age, gender, district } = req.body;

    // Convert age to integer
    const ageInt = parseInt(age);

    // Verify OTP
    const otpVerification = otpService.verifyOTP(userId, otp);
    
    if (!otpVerification.valid) {
      return res.status(400).json({
        status: 'Error',
        message: otpVerification.message,
        attemptsLeft: otpVerification.attemptsLeft
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

    // Extract email from user ID (in production, store this separately)
    const email = req.body.email; // For simplicity, we'll pass email in body

    // Create user
    const user = await prisma.user.create({
      data: {
        id: userId,
        name,
        email,
        phone,
        password: hashedPassword,
        bloodGroup,
        age: ageInt, // Use parsed integer
        gender,
        district,
        isEmailVerified: true,
        emergencyContact: req.body.emergencyContact
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bloodGroup: true,
        city: true,
        district: true,
        role: true,
        isEmailVerified: true,
        createdAt: true
      }
    });

    // Generate TOTP secret for future 2FA
    const { secret, qrCodeUrl } = otpService.generateSecret(userId);
    const qrCode = await otpService.generateQRCode(qrCodeUrl);

    // Update user with OTP secret
    await prisma.user.update({
      where: { id: userId },
      data: {
        otpSecret: secret,
        isOtpEnabled: false // User can enable later
      }
    });

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(201).json({
      status: 'Success',
      message: 'Registration completed successfully',
      data: {
        user,
        token,
        otpSecret: secret, // Only for development
        qrCode // QR code for TOTP setup
      }
    });

  } catch (error) {
    next(error);
  }
};

// Simplified login with ID and password
const login = async (req, res, next) => {
  try {
    const { email, password, totpCode } = req.body;

    // Find user by email or phone (email can be either)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { phone: email }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({
        status: 'Error',
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'Error',
        message: 'Invalid credentials'
      });
    }

    // Check if 2FA is enabled
    if (user.isOtpEnabled) {
      if (!totpCode) {
        return res.status(200).json({
          status: 'Success',
          message: '2FA required. Please enter your TOTP code.',
          requires2FA: true
        });
      }

      // Verify TOTP
      const isTotpValid = otpService.verifyTOTP(user.otpSecret, totpCode);
      
      if (!isTotpValid) {
        return res.status(401).json({
          status: 'Error',
          message: 'Invalid TOTP code'
        });
      }
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate token
    const token = generateToken(user.id);

    // Remove sensitive data
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      status: 'Success',
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token,
        isOtpEnabled: user.isOtpEnabled
      }
    });

  } catch (error) {
    next(error);
  }
};

// Enable 2FA for user
const enable2FA = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { totpCode } = req.body;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.otpSecret) {
      return res.status(400).json({
        status: 'Error',
        message: 'OTP secret not found. Please complete registration first.'
      });
    }

    // Verify TOTP code
    const isTotpValid = otpService.verifyTOTP(user.otpSecret, totpCode);
    
    if (!isTotpValid) {
      return res.status(400).json({
        status: 'Error',
        message: 'Invalid TOTP code'
      });
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: { isOtpEnabled: true }
    });

    res.json({
      status: 'Success',
      message: '2FA enabled successfully'
    });

  } catch (error) {
    next(error);
  }
};

// Disable 2FA for user
const disable2FA = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        status: 'Error',
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'Error',
        message: 'Invalid password'
      });
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: { isOtpEnabled: false }
    });

    res.json({
      status: 'Success',
      message: '2FA disabled successfully'
    });

  } catch (error) {
    next(error);
  }
};

// Get user profile
const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bloodGroup: true,
        age: true,
        gender: true,
        address: true,
        city: true,
        district: true,
        role: true,
        isDonor: true,
        isRecipient: true,
        canToggleRole: true,
        isAvailable: true,
        lastDonation: true,
        totalDonations: true,
        badges: true,
        hospitalName: true,
        department: true,
        isEmailVerified: true,
        isOtpEnabled: true,
        isActive: true,
        isApproved: true,
        memberSince: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        status: 'Error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'Success',
      data: { user }
    });

  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const allowedFields = [
      'name', 'phone', 'bloodGroup', 'age', 'gender', 
      'address', 'city', 'district', 'pincode',
      'isAvailable', 'emergencyContact'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bloodGroup: true,
        age: true,
        gender: true,
        address: true,
        city: true,
        district: true,
        role: true,
        isDonor: true,
        isRecipient: true,
        canToggleRole: true,
        isAvailable: true,
        lastDonation: true,
        totalDonations: true,
        badges: true,
        hospitalName: true,
        department: true,
        isEmailVerified: true,
        isOtpEnabled: true,
        isActive: true,
        isApproved: true,
        memberSince: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      status: 'Success',
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    next(error);
  }
};

// Get 2FA setup info
const get2FASetup = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { otpSecret: true, isOtpEnabled: true }
    });

    if (!user) {
      return res.status(404).json({
        status: 'Error',
        message: 'User not found'
      });
    }

    if (!user.otpSecret) {
      // Generate new secret
      const { secret, qrCodeUrl } = otpService.generateSecret(userId);
      const qrCode = await otpService.generateQRCode(qrCodeUrl);

      // Update user with secret
      await prisma.user.update({
        where: { id: userId },
        data: { otpSecret: secret }
      });

      return res.json({
        status: 'Success',
        message: '2FA setup information',
        data: {
          secret,
          qrCode,
          isOtpEnabled: user.isOtpEnabled,
          instructions: [
            '1. Scan the QR code with Google Authenticator or similar app',
            '2. Enter the 6-digit code to enable 2FA',
            '3. Keep your backup secret safe'
          ]
        }
      });
    }

    // User already has secret
    const qrCodeUrl = `otpauth://totp/Raktadan-${userId}?secret=${user.otpSecret}&issuer=Raktadan%20Blood%20Bank`;
    const qrCode = await otpService.generateQRCode(qrCodeUrl);

    res.json({
      status: 'Success',
      message: '2FA setup information',
      data: {
        secret: user.otpSecret,
        qrCode,
        isOtpEnabled: user.isOtpEnabled,
        instructions: user.isOtpEnabled 
          ? ['2FA is already enabled'] 
          : [
              '1. Scan the QR code with Google Authenticator or similar app',
              '2. Enter the 6-digit code to enable 2FA',
              '3. Keep your backup secret safe'
            ]
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  initiateRegistration,
  completeRegistration,
  login,
  enable2FA,
  disable2FA,
  getProfile,
  updateProfile,
  get2FASetup
};
