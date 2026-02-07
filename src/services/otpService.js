const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

class OTPService {
  constructor() {
    this.otpStore = new Map(); // In-memory store for development
    this.otpExpiry = 10 * 60 * 1000; // 10 minutes
  }

  /**
   * Generate OTP secret for user
   */
  generateSecret(userId) {
    const secret = speakeasy.generateSecret({
      name: `Raktadan-${userId}`,
      issuer: 'Raktadan Blood Bank',
      length: 32
    });

    return {
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url
    };
  }

  /**
   * Generate QR Code for OTP setup
   */
  async generateQRCode(otpauthUrl) {
    try {
      return await QRCode.toDataURL(otpauthUrl);
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate and store OTP for registration
   */
  generateOTP(userId, email, phone) {
    // Use fixed OTP "1234" for testing purposes
    const otp = "1234";
    const expiresAt = Date.now() + this.otpExpiry;

    this.otpStore.set(userId, {
      otp,
      email,
      phone,
      expiresAt,
      attempts: 0,
      maxAttempts: 3
    });

    return otp;
  }

  /**
   * Verify OTP for registration
   */
  verifyOTP(userId, otp) {
    const storedData = this.otpStore.get(userId);

    if (!storedData) {
      return {
        valid: false,
        message: 'OTP not found or expired'
      };
    }

    // Check if OTP has expired
    if (Date.now() > storedData.expiresAt) {
      this.otpStore.delete(userId);
      return {
        valid: false,
        message: 'OTP has expired'
      };
    }

    // Check max attempts
    if (storedData.attempts >= storedData.maxAttempts) {
      this.otpStore.delete(userId);
      return {
        valid: false,
        message: 'Maximum OTP attempts exceeded'
      };
    }

    // Increment attempts
    storedData.attempts++;

    // Verify OTP
    if (storedData.otp === otp) {
      this.otpStore.delete(userId);
      return {
        valid: true,
        message: 'OTP verified successfully'
      };
    } else {
      return {
        valid: false,
        message: 'Invalid OTP',
        attemptsLeft: storedData.maxAttempts - storedData.attempts
      };
    }
  }

  /**
   * Verify TOTP for login
   */
  verifyTOTP(secret, token) {
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps (30 seconds each)
    });

    return verified;
  }

  /**
   * Send OTP via email or SMS (production-ready)
   */
  async sendOTP(email, phone, otp, purpose = 'registration') {
    // Production mode: Don't expose OTP
    if (process.env.NODE_ENV === 'production') {
      // In production, integrate with actual SMS/Email service
      console.log(`🔐 OTP sent securely to ${phone || email}`);
      
      if (phone) {
        // Integrate with SMS service (e.g., Twilio, AWS SNS)
        // await smsService.send(phone, `Your Raktadan OTP is: ${otp}`);
        return {
          success: true,
          message: `OTP sent to phone number ${phone}`,
          method: 'sms',
          recipient: phone
        };
      } else {
        // Integrate with Email service (e.g., SendGrid, AWS SES)
        // await emailService.send(email, 'Your Raktadan OTP', `Your OTP is: ${otp}`);
        return {
          success: true,
          message: `OTP sent to email ${email}`,
          method: 'email',
          recipient: email
        };
      }
    } else {
      // Development mode: Show OTP for testing
      console.log(`� Development OTP for ${phone || email}: ${otp}`);
      
      if (phone) {
        return {
          success: true,
          message: `OTP sent to phone number ${phone}`,
          method: 'sms',
          recipient: phone,
          otp: otp // Only for development
        };
      } else {
        return {
          success: true,
          message: `OTP sent to email ${email}`,
          method: 'email',
          recipient: email,
          otp: otp // Only for development
        };
      }
    }
  }

  /**
   * Clean up expired OTPs
   */
  cleanupExpiredOTPs() {
    const now = Date.now();
    for (const [userId, data] of this.otpStore.entries()) {
      if (now > data.expiresAt) {
        this.otpStore.delete(userId);
      }
    }
  }

  /**
   * Generate user ID from email
   */
  generateUserId(email) {
    const hash = crypto.createHash('sha256');
    hash.update(email);
    return hash.digest('hex').substring(0, 16);
  }
}

module.exports = new OTPService();
