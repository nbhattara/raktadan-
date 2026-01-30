const User = require('../models/User');
const { PrismaClient } = require('@prisma/client');
const config = require('../config');

const prisma = new PrismaClient();

class UserController {
  // Toggle user role (DONOR <-> RECIPIENT)
  static async toggleRole(req, res, next) {
    try {
      const userId = req.user.id;
      const { newRole } = req.body;

      // Validate new role
      if (!['DONOR', 'RECIPIENT'].includes(newRole)) {
        return res.status(400).json({
          status: 'Error',
          message: 'Invalid role. Only DONOR and RECIPIENT roles can be toggled.'
        });
      }

      const updatedUser = await User.toggleUserRole(userId, newRole);

      res.json({
        status: 'Success',
        message: `Role successfully changed to ${newRole}`,
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isDonor: updatedUser.isDonor,
          isRecipient: updatedUser.isRecipient
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user profile with role-specific data
  static async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          status: 'Error',
          message: 'User not found'
        });
      }

      // Return role-specific data
      const profileData = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isDonor: user.isDonor,
        isRecipient: user.isRecipient,
        canToggleRole: user.canToggleRole,
        memberSince: user.memberSince,
        isActive: user.isActive,
        isApproved: user.isApproved,
        profilePhotoUrl: user.profilePhotoUrl
      };

      // Add donor-specific data
      if (user.isDonor) {
        profileData.bloodGroup = user.bloodGroup;
        profileData.age = user.age;
        profileData.gender = user.gender;
        profileData.city = user.city;
        profileData.district = user.district;
        profileData.isAvailable = user.isAvailable;
        profileData.lastDonation = user.lastDonation;
        profileData.totalDonations = user.totalDonations;
        profileData.badges = user.badges;
      }

      // Add hospital staff data
      if (['HOSPITAL_ADMIN', 'BLOOD_BANK_STAFF'].includes(user.role)) {
        profileData.hospitalName = user.hospitalName;
        profileData.department = user.department;
        profileData.staffId = user.staffId;
        profileData.workShift = user.workShift;
        profileData.managedHospitals = user.managedHospitals;
        profileData.managedBloodBanks = user.managedBloodBanks;
      }

      res.json({
        status: 'Success',
        data: profileData
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  static async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated directly
      delete updateData.password;
      delete updateData.role;
      delete updateData.isApproved;
      delete updateData.approvedBy;
      delete updateData.approvedAt;

      const updatedUser = await User.update(userId, updateData);

      res.json({
        status: 'Success',
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all users (Admin only)
  static async getAllUsers(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        role,
        isDonor,
        isRecipient,
        isActive,
        bloodGroup,
        district
      } = req.query;

      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        role,
        isDonor: isDonor === 'true',
        isRecipient: isRecipient === 'true',
        isActive: isActive === 'true',
        bloodGroup,
        district
      };

      const [users, totalCount] = await Promise.all([
        User.findAll(filters),
        User.count(filters)
      ]);

      res.json({
        status: 'Success',
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount,
            pages: Math.ceil(totalCount / parseInt(limit))
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Approve user (Admin/Hospital Admin only)
  static async approveUser(req, res, next) {
    try {
      const { userId } = req.params;
      const approvedBy = req.user.id;

      const updatedUser = await User.approveUser(userId, approvedBy);

      res.json({
        status: 'Success',
        message: 'User approved successfully',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  // Deactivate user (Admin only)
  static async deactivateUser(req, res, next) {
    try {
      const { userId } = req.params;

      const updatedUser = await User.deactivateUser(userId);

      res.json({
        status: 'Success',
        message: 'User deactivated successfully',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  // Get eligible donors for blood request
  static async getEligibleDonors(req, res, next) {
    try {
      const { bloodGroup, district, excludeRecent = true } = req.query;

      if (!bloodGroup || !district) {
        return res.status(400).json({
          status: 'Error',
          message: 'Blood group and district are required'
        });
      }

      const donors = await User.findEligibleDonors(
        bloodGroup,
        district,
        excludeRecent === 'true'
      );

      res.json({
        status: 'Success',
        data: {
          donors,
          count: donors.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get hospital staff (Hospital Admin only)
  static async getHospitalStaff(req, res, next) {
    try {
      const { hospitalId } = req.params;

      const staff = await User.findHospitalStaff(hospitalId);

      res.json({
        status: 'Success',
        data: {
          staff,
          count: staff.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Update last login
  static async updateLastLogin(req, res, next) {
    try {
      const userId = req.user.id;
      await User.updateLastLogin(userId);

      res.json({
        status: 'Success',
        message: 'Last login updated'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user statistics (Admin only)
  static async getUserStatistics(req, res, next) {
    try {
      const [
        totalUsers,
        activeUsers,
        donorUsers,
        recipientUsers,
        hospitalAdmins,
        bloodBankStaff,
        superAdmins,
        pendingApprovals
      ] = await Promise.all([
        User.count({}),
        User.count({ isActive: true }),
        User.count({ isDonor: true }),
        User.count({ isRecipient: true }),
        User.count({ role: 'HOSPITAL_ADMIN' }),
        User.count({ role: 'BLOOD_BANK_STAFF' }),
        User.count({ role: 'SUPER_ADMIN' }),
        User.count({ isApproved: false, role: { not: 'DONOR' } })
      ]);

      res.json({
        status: 'Success',
        data: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          donorUsers,
          recipientUsers,
          hospitalAdmins,
          bloodBankStaff,
          superAdmins,
          pendingApprovals,
          roleDistribution: {
            'SUPER_ADMIN': superAdmins,
            'HOSPITAL_ADMIN': hospitalAdmins,
            'BLOOD_BANK_STAFF': bloodBankStaff,
            'DONOR': donorUsers,
            'RECIPIENT': recipientUsers
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
