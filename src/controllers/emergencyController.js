const { PrismaClient } = require('@prisma/client');
const config = require('../config');

const prisma = new PrismaClient();

// Emergency blood finder - optimized for speed
const findEmergencyDonors = async (req, res, next) => {
  try {
    const { district, bloodGroup, urgency = 'HIGH' } = req.body;

    // For emergencies, prioritize most recent donors and closest locations
    const where = {
      isDonor: true,
      isAvailable: true,
      isEmailVerified: true,
      bloodGroup: bloodGroup,
      district: { contains: district, mode: 'insensitive' }
    };

    // For critical emergencies, reduce the waiting period to 60 days
    const waitingDays = urgency === 'CRITICAL' ? 60 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - waitingDays);

    where.OR = [
      { lastDonation: { lt: cutoffDate } },
      { lastDonation: null }
    ];

    // Get top 20 most available donors immediately
    const donors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        bloodGroup: true,
        age: true,
        city: true,
        district: true,
        lastDonation: true,
        totalDonations: true,
        badges: true,
        // Include coordinates for proximity if available
        coordinates: true
      },
      orderBy: [
        { lastDonation: 'asc' }, // Haven't donated in longest time
        { totalDonations: 'desc' }, // Most experienced first
        { createdAt: 'desc' } // Longest members first
      ],
      take: 20
    });

    // Calculate response confidence score
    const donorsWithScore = donors.map(donor => {
      let score = 100;

      // Deduct points for recent donations
      if (donor.lastDonation) {
        const daysSinceDonation = Math.floor((Date.now() - donor.lastDonation) / (1000 * 60 * 60 * 24));
        if (daysSinceDonation < waitingDays) {
          score -= 50;
        } else if (daysSinceDonation < waitingDays + 30) {
          score -= 20;
        }
      }

      // Bonus points for experienced donors
      if (donor.totalDonations >= 10) score += 10;
      if (donor.totalDonations >= 25) score += 20;

      // Bonus points for life savers
      if (donor.badges && donor.badges.includes('Life Saver')) score += 15;

      return {
        ...donor,
        responseScore: Math.max(0, score),
        estimatedResponseTime: this.estimateResponseTime(donor, urgency)
      };
    }).sort((a, b) => b.responseScore - a.responseScore);

    res.json({
      status: 'Success',
      message: `Emergency donors found for ${bloodGroup} in ${district}`,
      urgency,
      waitingPeriodDays: waitingDays,
      data: {
        donors: donorsWithScore,
        totalFound: donorsWithScore.length,
        averageResponseScore: Math.round(donorsWithScore.reduce((sum, d) => sum + d.responseScore, 0) / donorsWithScore.length),
        emergencyTips: this.getEmergencyTips(bloodGroup, urgency)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Quick ambulance finder for emergencies
const findEmergencyAmbulance = async (req, res, next) => {
  try {
    const { district, latitude, longitude, patientCondition = 'STABLE' } = req.body;

    const where = {
      isActive: true,
      verified: true,
      district: { contains: district, mode: 'insensitive' }
    };

    // For critical conditions, prioritize advanced/ICU ambulances
    if (patientCondition === 'CRITICAL') {
      where.OR = [
        { is24Hours: true },
        { vehicleType: { in: ['ADVANCED', 'ICU', 'NEONATAL'] } }
      ];
    }

    const ambulances = await prisma.ambulanceService.findMany({
      where,
      orderBy: [
        { averageResponseTime: 'asc' },
        { rating: 'desc' },
        { is24Hours: 'desc' }
      ],
      take: 10
    });

    // Add proximity calculation if coordinates provided
    let ambulancesWithDistance = ambulances;
    if (latitude && longitude) {
      ambulancesWithDistance = ambulances.map(ambulance => {
        if (ambulance.coordinates && ambulance.coordinates.latitude && ambulance.coordinates.longitude) {
          const distance = calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            ambulance.coordinates.latitude,
            ambulance.coordinates.longitude
          );
          return { ...ambulance, distance };
        }
        return { ...ambulance, distance: null };
      }).sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    res.json({
      status: 'Success',
      message: `Emergency ambulance services in ${district}`,
      patientCondition,
      data: {
        ambulances: ambulancesWithDistance,
        totalFound: ambulancesWithDistance.length,
        emergencyContacts: [
          { name: 'Nepal Health Emergency', number: '1155', available: '24/7' },
          { name: 'Red Cross Society', number: '+977-1-4270120', available: '24/7' },
          { name: 'Police Emergency', number: '100', available: '24/7' }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

// Log emergency request for analytics
const logEmergencyRequest = async (req, res, next) => {
  try {
    const { type, district, bloodGroup, urgency, patientCondition } = req.body;

    // This would typically go to a separate EmergencyRequest table
    // For now, we'll update statistics
    console.log(`Emergency request logged: ${type} - ${district} - ${bloodGroup} - ${urgency}`);

    // Update emergency statistics
    await prisma.$executeRaw`
      INSERT INTO emergency_logs (type, district, blood_group, urgency, patient_condition, created_at)
      VALUES (${type}, ${district}, ${bloodGroup}, ${urgency}, ${patientCondition}, NOW())
    `;

    res.json({
      status: 'Success',
      message: 'Emergency request logged successfully',
      data: {
        requestId: `EMR-${Date.now()}`,
        timestamp: new Date().toISOString(),
        estimatedResponseTime: this.getEstimatedResponseTime(type, district, urgency)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get emergency statistics for dashboard
const getEmergencyStats = async (req, res, next) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // This would typically query emergency_logs table
    const stats = {
      last24Hours: {
        bloodRequests: 0, // Would be calculated from logs
        ambulanceRequests: 0,
        successfulMatches: 0
      },
      last7Days: {
        bloodRequests: 0,
        ambulanceRequests: 0,
        successfulMatches: 0,
        averageResponseTime: 0
      },
      criticalCases: {
        today: 0,
        thisWeek: 0
      },
      livesSaved: {
        thisWeek: 0,
        thisMonth: 0
      }
    };

    res.json({
      status: 'Success',
      message: 'Emergency statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions
const estimateResponseTime = (donor, urgency) => {
  const baseTime = urgency === 'CRITICAL' ? 15 : 30; // minutes
  
  if (donor.totalDonations >= 10) return baseTime - 5;
  if (donor.badges && donor.badges.includes('Life Saver')) return baseTime - 10;
  
  return baseTime;
};

const getEmergencyTips = (bloodGroup, urgency) => {
  const tips = [
    `Call multiple donors simultaneously for ${urgency} urgency`,
    `${bloodGroup} is ${bloodGroup === 'O_POSITIVE' ? 'universal donor' : 'compatible with A+, B+, AB+'}`,
    'Have patient details ready when calling',
    'Request hospital ID proof if available'
  ];

  if (urgency === 'CRITICAL') {
    tips.push('Contact hospital blood bank immediately');
    tips.push('Consider multiple hospitals if first unavailable');
  }

  return tips;
};

const getEstimatedResponseTime = (type, district, urgency) => {
  const baseTimes = {
    blood: urgency === 'CRITICAL' ? 30 : 60, // minutes
    ambulance: urgency === 'CRITICAL' ? 15 : 25
  };

  // Add time for Kathmandu vs other districts
  const districtMultiplier = district.toLowerCase().includes('kathmandu') ? 1 : 1.5;

  return Math.round(baseTimes[type] * districtMultiplier);
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

module.exports = {
  findEmergencyDonors,
  findEmergencyAmbulance,
  logEmergencyRequest,
  getEmergencyStats
};
