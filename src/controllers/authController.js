const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const config = require('../config');

const prisma = new PrismaClient();

const generateToken = (userId) => {
  return jwt.sign({ userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE
  });
};

// Register a new user
const register = async (req, res, next) => {
  try {
    const { email, phone } = req.body;

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

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, config.BCRYPT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        ...req.body,
        password: hashedPassword,
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
        isEmailVerified: true,
        role: true,
        createdAt: true
      }
    });

    const token = generateToken(user.id);

    res.status(201).json({
      status: 'Success',
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        phone: true,
        bloodGroup: true,
        city: true,
        district: true,
        role: true,
        isEmailVerified: true
      }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: 'Error',
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      status: 'Success',
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
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
        state: true,
        district: true,
        pincode: true,
        isDonor: true,
        isAvailable: true,
        lastDonation: true,
        medicalConditions: true,
        emergencyContact: true,
        role: true,
        isEmailVerified: true,
        memberSince: true,
        totalDonations: true,
        badges: true,
        createdAt: true,
        updatedAt: true
      }
    });

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
    const allowedUpdates = [
      'name', 'phone', 'address', 'city', 'state', 'district', 'pincode',
      'emergencyContact', 'medicalConditions', 'isDonor', 'isAvailable'
    ];

    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({
        status: 'Error',
        message: 'Invalid updates'
      });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: req.body,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bloodGroup: true,
        city: true,
        district: true,
        isDonor: true,
        isAvailable: true,
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

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
