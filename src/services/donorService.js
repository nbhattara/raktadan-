const { PrismaClient } = require('@prisma/client');
const config = require('../config');

const prisma = new PrismaClient();

class DonorService {
  static async findEligibleDonors(filters) {
    const {
      district,
      bloodGroup,
      isActiveDonor = true,
      page = 1,
      limit = 20
    } = filters;

    const where = {
      isDonor: true,
      isAvailable: isActiveDonor,
      isEmailVerified: true
    };

    if (bloodGroup) {
      where.bloodGroup = bloodGroup;
    }

    if (district) {
      where.district = { contains: district, mode: 'insensitive' };
    }

    // Check last donation date (must be at least 90 days ago)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    where.OR = [
      { lastDonation: { lt: ninetyDaysAgo } },
      { lastDonation: null }
    ];

    const skip = (page - 1) * limit;

    const [donors, total] = await Promise.all([
      prisma.user.findMany({
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
          lastDonation: true,
          totalDonations: true,
          badges: true
        },
        orderBy: { lastDonation: 'asc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    return {
      donors,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total,
        limit
      }
    };
  }

  static async getDonorStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const [
      totalDonors,
      activeDonors,
      newDonorsThisMonth,
      donationsThisMonth,
      totalDonations
    ] = await Promise.all([
      prisma.user.count({
        where: { isDonor: true, isEmailVerified: true }
      }),
      prisma.user.count({
        where: {
          isDonor: true,
          isAvailable: true,
          isEmailVerified: true,
          OR: [
            { lastDonation: { lt: ninetyDaysAgo } },
            { lastDonation: null }
          ]
        }
      }),
      prisma.user.count({
        where: {
          isDonor: true,
          createdAt: { gte: startOfMonth },
          isEmailVerified: true
        }
      }),
      prisma.donationRecord.count({
        where: {
          donationDate: { gte: startOfMonth },
          verified: true
        }
      }),
      prisma.donationRecord.count({
        where: { verified: true }
      })
    ]);

    // Lives saved estimation (1 donation can save up to 3 lives)
    const livesSaved = totalDonations * 3;

    return {
      totalDonors,
      activeDonors,
      newDonorsThisMonth,
      donationsThisMonth,
      livesSaved
    };
  }

  static async checkDonationEligibility(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isDonor: true,
        isAvailable: true,
        age: true,
        lastDonation: true
      }
    });

    if (!user || !user.isDonor) {
      return { eligible: false, reason: 'User is not registered as a donor' };
    }

    if (!user.isAvailable) {
      return { eligible: false, reason: 'Donor is currently unavailable' };
    }

    if (user.age < 18 || user.age > 65) {
      return { eligible: false, reason: 'Age must be between 18 and 65 years' };
    }

    // Check last donation date
    if (user.lastDonation) {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      if (user.lastDonation > ninetyDaysAgo) {
        const nextEligibleDate = new Date(user.lastDonation);
        nextEligibleDate.setDate(nextEligibleDate.getDate() + 90);

        return {
          eligible: false,
          reason: 'Must wait 90 days between donations',
          nextEligibleDate
        };
      }
    }

    return { eligible: true };
  }

  static async recordDonation(userId, donationData) {
    const eligibility = await this.checkDonationEligibility(userId);
    
    if (!eligibility.eligible) {
      throw new Error(eligibility.reason);
    }

    // Create donation record and update user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create donation record
      const donation = await tx.donationRecord.create({
        data: {
          donorId: userId,
          donationDate: new Date(),
          donationType: donationData.donationType,
          location: donationData.location,
          organization: donationData.organization,
          verified: false
        }
      });

      // Update user's last donation date and total donations
      await tx.user.update({
        where: { id: userId },
        data: {
          lastDonation: new Date(),
          totalDonations: {
            increment: 1
          }
        }
      });

      return donation;
    });

    return result;
  }

  static async getDonationHistory(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [donations, total] = await Promise.all([
      prisma.donationRecord.findMany({
        where: { donorId: userId },
        orderBy: { donationDate: 'desc' },
        skip,
        take: limit
      }),
      prisma.donationRecord.count({
        where: { donorId: userId }
      })
    ]);

    return {
      donations,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total,
        limit
      }
    };
  }

  static async getTopDonors(limit = 10) {
    const topDonors = await prisma.donationRecord.groupBy({
      by: ['donorId'],
      where: { verified: true },
      _count: {
        id: true
      },
      _max: {
        donationDate: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: limit
    });

    // Get user details for each donor
    const donorIds = topDonors.map(d => d.donorId);
    const users = await prisma.user.findMany({
      where: { id: { in: donorIds } },
      select: {
        id: true,
        name: true,
        bloodGroup: true,
        city: true,
        district: true,
        totalDonations: true
      }
    });

    // Combine results
    const result = topDonors.map(donor => {
      const user = users.find(u => u.id === donor.donorId);
      return {
        ...user,
        totalDonations: donor._count.id,
        lastDonation: donor._max.donationDate
      };
    }).sort((a, b) => b.totalDonations - a.totalDonations);

    return result;
  }

  static async getDonorsByBloodGroup() {
    const donorsByGroup = await prisma.user.groupBy({
      by: ['bloodGroup'],
      where: {
        isDonor: true,
        isAvailable: true,
        isEmailVerified: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    return donorsByGroup;
  }

  static async getDonorsByDistrict() {
    const donorsByDistrict = await prisma.user.groupBy({
      by: ['district'],
      where: {
        isDonor: true,
        isEmailVerified: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    return donorsByDistrict;
  }

  static async updateDonorBadges(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalDonations: true, badges: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const badges = [];
    const donations = user.totalDonations;

    // Award badges based on donation count
    if (donations >= 1) badges.push('First Donation');
    if (donations >= 5) badges.push('Regular Donor');
    if (donations >= 10) badges.push('Dedicated Donor');
    if (donations >= 25) badges.push('Life Saver');
    if (donations >= 50) badges.push('Hero Donor');
    if (donations >= 100) badges.push('Legendary Donor');

    // Update user badges
    await prisma.user.update({
      where: { id: userId },
      data: { badges }
    });

    return badges;
  }

  static async searchNearbyDonors(latitude, longitude, radiusKm = 10, bloodGroup) {
    const where = {
      isDonor: true,
      isAvailable: true,
      isEmailVerified: true,
      coordinates: { not: null }
    };

    if (bloodGroup) {
      where.bloodGroup = bloodGroup;
    }

    // Check last donation date
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    where.OR = [
      { lastDonation: { lt: ninetyDaysAgo } },
      { lastDonation: null }
    ];

    const donors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        bloodGroup: true,
        coordinates: true,
        city: true,
        district: true,
        lastDonation: true
      }
    });

    // Calculate distances and filter
    const nearbyDonors = donors
      .map(donor => {
        if (!donor.coordinates || !donor.coordinates.latitude || !donor.coordinates.longitude) {
          return { ...donor, distance: Infinity };
        }

        const distance = this.calculateDistance(
          latitude, longitude,
          donor.coordinates.latitude,
          donor.coordinates.longitude
        );

        return { ...donor, distance };
      })
      .filter(donor => donor.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return nearbyDonors;
  }

  // Haversine distance calculation
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}

module.exports = DonorService;
