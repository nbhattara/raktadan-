const { PrismaClient } = require('@prisma/client');
const config = require('../config');

const prisma = new PrismaClient();

// Get blood inventory summary
const getInventorySummary = async (req, res, next) => {
  try {
    // This would typically be a separate BloodInventory table
    // For now, we'll calculate based on available donors and recent donations
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    // Get available donors by blood group
    const availableDonorsByGroup = await prisma.user.groupBy({
      by: ['bloodGroup'],
      where: {
        isDonor: true,
        isAvailable: true,
        isEmailVerified: true,
        OR: [
          { lastDonation: { lt: thirtyDaysAgo } },
          { lastDonation: null }
        ]
      },
      _count: {
        id: true
      }
    });

    // Get recent donations by blood group (using User model as fallback)
    let recentDonationsByGroup = [];
    try {
      recentDonationsByGroup = await prisma.user.groupBy({
        by: ['bloodGroup'],
        where: {
          isDonor: true,
          lastDonation: { gte: thirtyDaysAgo }
        },
        _count: {
          id: true
        }
      });
    } catch (error) {
      console.log('Donation grouping not available, using empty array');
    }

    // Get current requests by blood group
    const currentRequestsByGroup = await prisma.bloodRequest.groupBy({
      by: ['bloodGroup'],
      where: {
        status: { in: ['PENDING', 'APPROVED'] },
        requiredBy: { gt: new Date() }
      },
      _sum: {
        unitsRequired: true
      },
      _count: {
        id: true
      }
    });

    // Calculate estimated inventory
    const inventory = config.BLOOD_GROUPS.map(bloodGroup => {
      const availableDonors = availableDonorsByGroup.find(g => g.bloodGroup === bloodGroup)?._count.id || 0;
      const currentRequests = currentRequestsByGroup.find(g => g.bloodGroup === bloodGroup)?._count.id || 0;
      const unitsNeeded = currentRequestsByGroup.find(g => g.bloodGroup === bloodGroup)?._sum.unitsRequired || 0;

      return {
        bloodGroup,
        availableDonors,
        currentRequests,
        unitsNeeded,
        estimatedSupply: availableDonors * 2, // Assuming each donor can donate 2 units
        deficit: Math.max(0, unitsNeeded - (availableDonors * 2)),
        status: unitsNeeded > availableDonors * 2 ? 'CRITICAL' : unitsNeeded > availableDonors ? 'LOW' : 'ADEQUATE'
      };
    });

    res.json({
      status: 'Success',
      message: 'Blood inventory summary retrieved successfully',
      data: {
        inventory,
        lastUpdated: new Date(),
        totalAvailableDonors: availableDonorsByGroup.reduce((sum, g) => sum + g._count.id, 0),
        totalPendingRequests: currentRequestsByGroup.reduce((sum, g) => sum + g._count.id, 0),
        totalUnitsNeeded: currentRequestsByGroup.reduce((sum, g) => sum + (g._sum.unitsRequired || 0), 0)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get inventory by district
const getInventoryByDistrict = async (req, res, next) => {
  try {
    const { district } = req.query;

    if (!district) {
      return res.status(400).json({
        status: 'Error',
        message: 'District is required'
      });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    // Get available donors in the district
    const availableDonorsByGroup = await prisma.user.groupBy({
      by: ['bloodGroup'],
      where: {
        isDonor: true,
        isAvailable: true,
        isEmailVerified: true,
        district: { contains: district, mode: 'insensitive' },
        OR: [
          { lastDonation: { lt: thirtyDaysAgo } },
          { lastDonation: null }
        ]
      },
      _count: {
        id: true
      }
    });

    // Get current requests in the district
    const currentRequestsByGroup = await prisma.bloodRequest.groupBy({
      by: ['bloodGroup'],
      where: {
        hospitalDistrict: { contains: district, mode: 'insensitive' },
        status: { in: ['PENDING', 'APPROVED'] },
        requiredBy: { gt: new Date() }
      },
      _sum: {
        unitsRequired: true
      },
      _count: {
        id: true
      }
    });

    const inventory = config.BLOOD_GROUPS.map(bloodGroup => {
      const availableDonors = availableDonorsByGroup.find(g => g.bloodGroup === bloodGroup)?._count.id || 0;
      const currentRequests = currentRequestsByGroup.find(g => g.bloodGroup === bloodGroup)?._count.id || 0;
      const unitsNeeded = currentRequestsByGroup.find(g => g.bloodGroup === bloodGroup)?._sum.unitsRequired || 0;

      return {
        bloodGroup,
        availableDonors,
        currentRequests,
        unitsNeeded,
        estimatedSupply: availableDonors * 2,
        deficit: Math.max(0, unitsNeeded - (availableDonors * 2)),
        status: unitsNeeded > availableDonors * 2 ? 'CRITICAL' : unitsNeeded > availableDonors ? 'LOW' : 'ADEQUATE'
      };
    });

    res.json({
      status: 'Success',
      message: `Blood inventory for ${district} retrieved successfully`,
      data: {
        district,
        inventory,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get critical shortages
const getCriticalShortages = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    // Get available donors by blood group
    const availableDonorsByGroup = await prisma.user.groupBy({
      by: ['bloodGroup'],
      where: {
        isDonor: true,
        isAvailable: true,
        isEmailVerified: true,
        OR: [
          { lastDonation: { lt: thirtyDaysAgo } },
          { lastDonation: null }
        ]
      },
      _count: {
        id: true
      }
    });

    // Get current urgent requests
    const urgentRequests = await prisma.bloodRequest.groupBy({
      by: ['bloodGroup', 'hospitalDistrict'],
      where: {
        status: { in: ['PENDING', 'APPROVED'] },
        urgency: { in: ['HIGH', 'CRITICAL'] },
        requiredBy: { gt: new Date() }
      },
      _sum: {
        unitsRequired: true
      },
      _count: {
        id: true
      }
    });

    // Calculate critical shortages
    const criticalShortages = urgentRequests.map(request => {
      const availableDonors = availableDonorsByGroup.find(g => g.bloodGroup === request.bloodGroup)?._count.id || 0;
      const estimatedSupply = availableDonors * 2;
      const deficit = Math.max(0, request._sum.unitsRequired - estimatedSupply);

      return {
        bloodGroup: request.bloodGroup,
        district: request.hospitalDistrict,
        urgentRequests: request._count.id,
        unitsNeeded: request._sum.unitsRequired,
        estimatedSupply,
        deficit,
        severity: deficit > estimatedSupply ? 'CRITICAL' : 'HIGH'
      };
    }).filter(shortage => shortage.deficit > 0)
    .sort((a, b) => b.deficit - a.deficit);

    res.json({
      status: 'Success',
      message: 'Critical blood shortages retrieved successfully',
      data: {
        criticalShortages,
        totalCriticalCases: criticalShortages.length,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get donation trends
const getDonationTrends = async (req, res, next) => {
  try {
    const { period = '30' } = req.query; // days
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily donation counts
    const dailyDonations = await prisma.donationRecord.groupBy({
      by: ['donationDate'],
      where: {
        donationDate: { gte: startDate },
        verified: true
      },
      _count: {
        id: true
      },
      orderBy: {
        donationDate: 'asc'
      }
    });

    // Get donations by blood group
    const donationsByGroup = await prisma.donationRecord.groupBy({
      by: ['donationType'],
      where: {
        donationDate: { gte: startDate },
        verified: true
      },
      _count: {
        id: true
      }
    });

    // Get top donating districts
    const topDistricts = await prisma.user.groupBy({
      by: ['district'],
      where: {
        isDonor: true,
        lastDonation: { gte: startDate }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    res.json({
      status: 'Success',
      message: 'Donation trends retrieved successfully',
      data: {
        period: `${days} days`,
        dailyDonations,
        donationsByGroup,
        topDistricts,
        totalDonations: dailyDonations.reduce((sum, d) => sum + d._count.id, 0)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update blood inventory (admin only)
const updateInventory = async (req, res, next) => {
  try {
    const { bloodGroup, units, operation, district, hospitalName } = req.body;

    // This would typically update a BloodInventory table
    // For now, we'll just return a success message
    res.json({
      status: 'Success',
      message: 'Blood inventory updated successfully',
      data: {
        bloodGroup,
        units,
        operation, // 'add' or 'subtract'
        district,
        hospitalName,
        timestamp: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventorySummary,
  getInventoryByDistrict,
  getCriticalShortages,
  getDonationTrends,
  updateInventory
};
