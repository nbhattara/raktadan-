const { PrismaClient } = require('@prisma/client');
const config = require('../config');

const prisma = new PrismaClient();

// Search eligible donors
const searchDonors = async (req, res, next) => {
  try {
    const {
      district,
      bloodGroup,
      isActiveDonor = true,
      page = 1,
      limit = 10
    } = req.query;

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

    const skip = (parseInt(page) - 1) * parseInt(limit);

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
        take: parseInt(limit)
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      status: 'Success',
      message: 'Donors retrieved successfully',
      data: {
        donors,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get donor statistics
const getDonorStats = async (req, res, next) => {
  try {
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

    res.json({
      status: 'Success',
      message: 'Donor statistics retrieved successfully',
      data: {
        totalDonors,
        activeDonors,
        newDonorsThisMonth,
        donationsThisMonth,
        livesSaved
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get top donors
const getTopDonors = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

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
      take: parseInt(limit)
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

    res.json({
      status: 'Success',
      message: 'Top donors retrieved successfully',
      data: {
        donors: result,
        count: result.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Check donation eligibility
const checkEligibility = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        isDonor: true,
        isAvailable: true,
        age: true,
        lastDonation: true
      }
    });

    if (!user || !user.isDonor) {
      return res.status(400).json({
        status: 'Error',
        message: 'User is not registered as a donor'
      });
    }

    if (!user.isAvailable) {
      return res.status(400).json({
        status: 'Error',
        message: 'Donor is currently unavailable'
      });
    }

    if (user.age < 18 || user.age > 65) {
      return res.status(400).json({
        status: 'Error',
        message: 'Age must be between 18 and 65 years'
      });
    }

    // Check last donation date
    if (user.lastDonation) {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      if (user.lastDonation > ninetyDaysAgo) {
        const nextEligibleDate = new Date(user.lastDonation);
        nextEligibleDate.setDate(nextEligibleDate.getDate() + 90);

        return res.json({
          status: 'Success',
          message: 'Eligibility check completed',
          data: {
            eligible: false,
            reason: 'Must wait 90 days between donations',
            nextEligibleDate
          }
        });
      }
    }

    res.json({
      status: 'Success',
      message: 'Eligibility check completed',
      data: { eligible: true }
    });
  } catch (error) {
    next(error);
  }
};

// Record a donation
const recordDonation = async (req, res, next) => {
  try {
    const { donationType, location, organization } = req.body;

    // Check eligibility first
    const eligibility = await checkEligibilityLogic(req.user.id);
    if (!eligibility.eligible) {
      return res.status(400).json({
        status: 'Error',
        message: eligibility.reason
      });
    }

    // Create donation record and update user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create donation record
      const donation = await tx.donationRecord.create({
        data: {
          donorId: req.user.id,
          donationDate: new Date(),
          donationType,
          location,
          organization,
          verified: false
        }
      });

      // Update user's last donation date and total donations
      await tx.user.update({
        where: { id: req.user.id },
        data: {
          lastDonation: new Date(),
          totalDonations: {
            increment: 1
          }
        }
      });

      return donation;
    });

    res.status(201).json({
      status: 'Success',
      message: 'Donation recorded successfully',
      data: { donation: result }
    });
  } catch (error) {
    next(error);
  }
};

// Get donation history
const getDonationHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [donations, total] = await Promise.all([
      prisma.donationRecord.findMany({
        where: { donorId: req.user.id },
        orderBy: { donationDate: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.donationRecord.count({
        where: { donorId: req.user.id }
      })
    ]);

    res.json({
      status: 'Success',
      message: 'Donation history retrieved successfully',
      data: {
        donations,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get donor card information
const getDonorCard = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        bloodGroup: true,
        district: true,
        memberSince: true,
        totalDonations: true,
        lastDonation: true,
        badges: true
      }
    });

    res.json({
      status: 'Success',
      message: 'Donor card information retrieved',
      data: {
        donor: user,
        note: 'PDF generation will be implemented in the next phase'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to check eligibility
const checkEligibilityLogic = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
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
};

module.exports = {
  searchDonors,
  getDonorStats,
  getTopDonors,
  checkEligibility,
  recordDonation,
  getDonationHistory,
  getDonorCard
};
