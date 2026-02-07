const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get dashboard statistics
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalDonors,
      totalHospitals,
      urgentRequests,
      totalAmbulances,
      totalCamps
    ] = await Promise.all([
      prisma.user.count({ where: { isDonor: true } }).catch(() => 0),
      prisma.hospital.count().catch(() => 0),
      prisma.bloodRequest.count({ where: { urgency: 'CRITICAL' } }).catch(() => 0),
      prisma.ambulanceService.count().catch(() => 0),
      prisma.donationCamp.count().catch(() => 0)
    ]);

    // Get donations count separately as it might not exist
    let totalDonations = 0;
    try {
      totalDonations = await prisma.donation.count();
    } catch (error) {
      console.log('Donation model not available, using 0');
    }

    res.json({
      status: 'Success',
      message: 'Dashboard statistics retrieved successfully',
      data: {
        totalDonors,
        totalDonations,
        totalHospitals,
        urgentRequests,
        totalAmbulances,
        totalCamps
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get donation statistics
const getDonationStats = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      donationsByGroup,
      donationsByDistrict,
      recentDonations,
      totalDonations
    ] = await Promise.all([
      prisma.donation.groupBy({
        by: ['bloodGroup'],
        where: {
          donationDate: { gte: startDate }
        },
        _count: { id: true },
        _sum: { units: true }
      }),
      prisma.user.groupBy({
        by: ['district'],
        where: { isDonor: true },
        _count: { id: true }
      }),
      prisma.donation.findMany({
        where: {
          donationDate: { gte: startDate }
        },
        orderBy: { donationDate: 'desc' },
        take: 10,
        include: {
          donor: {
            select: { name: true, bloodGroup: true }
          }
        }
      }),
      prisma.donation.count({
        where: {
          donationDate: { gte: startDate }
        }
      })
    ]);

    res.json({
      status: 'Success',
      message: 'Donation statistics retrieved successfully',
      data: {
        period: `${days} days`,
        donationsByGroup,
        donationsByDistrict,
        recentDonations,
        totalDonations
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get hospital statistics
const getHospitalStats = async (req, res, next) => {
  try {
    const [
      hospitalsByType,
      hospitalsByDistrict,
      hospitalsWithBloodBank,
      totalHospitals
    ] = await Promise.all([
      prisma.hospital.groupBy({
        by: ['type'],
        _count: { id: true }
      }),
      prisma.hospital.groupBy({
        by: ['district'],
        _count: { id: true }
      }),
      prisma.hospital.count({
        where: { bloodBankAvailable: true }
      }),
      prisma.hospital.count()
    ]);

    res.json({
      status: 'Success',
      message: 'Hospital statistics retrieved successfully',
      data: {
        hospitalsByType,
        hospitalsByDistrict,
        hospitalsWithBloodBank,
        totalHospitals
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get ambulance statistics
const getAmbulanceStats = async (req, res, next) => {
  try {
    const [
      ambulancesByType,
      ambulancesByDistrict,
      availableAmbulances,
      totalAmbulances
    ] = await Promise.all([
      prisma.ambulanceService.groupBy({
        by: ['serviceType'],
        _count: { id: true }
      }),
      prisma.ambulanceService.groupBy({
        by: ['district'],
        _count: { id: true }
      }),
      prisma.ambulanceService.count({
        where: { isActive: true }
      }),
      prisma.ambulanceService.count()
    ]);

    res.json({
      status: 'Success',
      message: 'Ambulance statistics retrieved successfully',
      data: {
        ambulancesByType,
        ambulancesByDistrict,
        availableAmbulances,
        totalAmbulances
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get emergency statistics
const getEmergencyStats = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      emergencyRequests,
      criticalBloodRequests,
      emergencyAmbulanceRequests,
      resolvedEmergencies
    ] = await Promise.all([
      prisma.emergencyRequest.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      prisma.bloodRequest.count({
        where: {
          urgency: 'CRITICAL',
          createdAt: { gte: startDate }
        }
      }),
      prisma.ambulanceRequest.count({
        where: {
          urgency: 'CRITICAL',
          createdAt: { gte: startDate }
        }
      }),
      prisma.emergencyRequest.count({
        where: {
          status: 'RESOLVED',
          createdAt: { gte: startDate }
        }
      })
    ]);

    res.json({
      status: 'Success',
      message: 'Emergency statistics retrieved successfully',
      data: {
        period: `${days} days`,
        emergencyRequests,
        criticalBloodRequests,
        emergencyAmbulanceRequests,
        resolvedEmergencies
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getDonationStats,
  getHospitalStats,
  getAmbulanceStats,
  getEmergencyStats
};
