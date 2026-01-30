const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class User {
  static async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    return await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword
      }
    });
  }

  static async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        managedHospitals: true,
        managedBloodBanks: true
      }
    });
  }

  static async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        managedHospitals: true,
        managedBloodBanks: true
      }
    });
  }

  static async findByPhone(phone) {
    return await prisma.user.findUnique({
      where: { phone }
    });
  }

  static async update(id, updateData) {
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    return await prisma.user.update({
      where: { id },
      data: updateData
    });
  }

  static async delete(id) {
    return await prisma.user.delete({
      where: { id }
    });
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  static async findAll(filters = {}) {
    const { 
      page = 1, 
      limit = 20, 
      bloodGroup, 
      district, 
      isAvailable, 
      role, 
      isDonor, 
      isRecipient,
      isActive 
    } = filters;
    
    const where = {};
    if (bloodGroup) where.bloodGroup = bloodGroup;
    if (district) where.district = district;
    if (isAvailable !== undefined) where.isAvailable = isAvailable;
    if (role) where.role = role;
    if (isDonor !== undefined) where.isDonor = isDonor;
    if (isRecipient !== undefined) where.isRecipient = isRecipient;
    if (isActive !== undefined) where.isActive = isActive;

    const skip = (page - 1) * limit;

    return await prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bloodGroup: true,
        age: true,
        gender: true,
        city: true,
        district: true,
        role: true,
        isDonor: true,
        isRecipient: true,
        canToggleRole: true,
        isAvailable: true,
        totalDonations: true,
        badges: true,
        memberSince: true,
        isActive: true,
        isApproved: true,
        hospitalName: true,
        department: true
      }
    });
  }

  static async count(filters = {}) {
    const { 
      bloodGroup, 
      district, 
      isAvailable, 
      role, 
      isDonor, 
      isRecipient,
      isActive 
    } = filters;
    
    const where = {};
    if (bloodGroup) where.bloodGroup = bloodGroup;
    if (district) where.district = district;
    if (isAvailable !== undefined) where.isAvailable = isAvailable;
    if (role) where.role = role;
    if (isDonor !== undefined) where.isDonor = isDonor;
    if (isRecipient !== undefined) where.isRecipient = isRecipient;
    if (isActive !== undefined) where.isActive = isActive;

    return await prisma.user.count({ where });
  }

  // Role management methods
  static async toggleUserRole(userId, newRole) {
    const user = await this.findById(userId);
    if (!user || !user.canToggleRole) {
      throw new Error('User cannot toggle role');
    }

    const updateData = {
      role: newRole,
      isDonor: newRole === 'DONOR',
      isRecipient: newRole === 'RECIPIENT'
    };

    return await this.update(userId, updateData);
  }

  static async approveUser(userId, approvedBy) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        isApproved: true,
        approvedBy,
        approvedAt: new Date()
      }
    });
  }

  static async deactivateUser(userId) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false
      }
    });
  }

  // Donor specific methods
  static async findEligibleDonors(bloodGroup, district, excludeRecentDonors = true) {
    const where = {
      bloodGroup,
      district,
      isDonor: true,
      isAvailable: true,
      isActive: true
    };

    if (excludeRecentDonors) {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      where.OR = [
        { lastDonation: null },
        { lastDonation: { lt: ninetyDaysAgo } }
      ];
    }

    return await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        bloodGroup: true,
        age: true,
        gender: true,
        city: true,
        district: true,
        totalDonations: true,
        lastDonation: true,
        coordinates: true
      }
    });
  }

  // Hospital/Blood Bank staff methods
  static async findHospitalStaff(hospitalId) {
    return await prisma.user.findMany({
      where: {
        hospitalId,
        isActive: true,
        isApproved: true,
        role: { in: ['HOSPITAL_ADMIN', 'BLOOD_BANK_STAFF'] }
      }
    });
  }

  static async updateLastLogin(userId) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date()
      }
    });
  }
}

module.exports = User;
