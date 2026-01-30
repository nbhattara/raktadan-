const { PrismaClient } = require('@prisma/client');
const config = require('../config');

const prisma = new PrismaClient();

// Search ambulance services
const searchAmbulances = async (req, res, next) => {
  try {
    const {
      district,
      city,
      serviceType,
      vehicleType,
      is24Hours,
      verified = true,
      page = 1,
      limit = 20
    } = req.query;

    const where = {
      isActive: true,
      verified
    };

    if (district) {
      where.district = { contains: district, mode: 'insensitive' };
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (serviceType) {
      where.serviceType = serviceType;
    }

    if (vehicleType) {
      where.vehicleType = vehicleType;
    }

    if (is24Hours !== undefined) {
      where.is24Hours = is24Hours === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [ambulances, total] = await Promise.all([
      prisma.ambulanceService.findMany({
        where,
        orderBy: [
          { rating: 'desc' },
          { averageResponseTime: 'asc' }
        ],
        skip,
        take: parseInt(limit)
      }),
      prisma.ambulanceService.count({ where })
    ]);

    res.json({
      status: 'Success',
      message: 'Ambulance services retrieved successfully',
      data: {
        ambulances,
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

// Get emergency ambulances
const getEmergencyAmbulances = async (req, res, next) => {
  try {
    const { district } = req.query;

    if (!district) {
      return res.status(400).json({
        status: 'Error',
        message: 'District is required for emergency search'
      });
    }

    const ambulances = await prisma.ambulanceService.findMany({
      where: {
        district: { contains: district, mode: 'insensitive' },
        isActive: true,
        verified: true,
        OR: [
          { is24Hours: true },
          { vehicleType: { in: ['ADVANCED', 'ICU'] } }
        ]
      },
      orderBy: [
        { averageResponseTime: 'asc' },
        { rating: 'desc' }
      ],
      take: 10
    });

    res.json({
      status: 'Success',
      message: 'Emergency ambulance services retrieved successfully',
      data: {
        ambulances,
        count: ambulances.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get ambulance by ID
const getAmbulanceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ambulance = await prisma.ambulanceService.findUnique({
      where: { id }
    });

    if (!ambulance) {
      return res.status(404).json({
        status: 'Error',
        message: 'Ambulance service not found'
      });
    }

    res.json({
      status: 'Success',
      message: 'Ambulance service retrieved successfully',
      data: { ambulance }
    });
  } catch (error) {
    next(error);
  }
};

// Create ambulance service (admin only)
const createAmbulance = async (req, res, next) => {
  try {
    const ambulance = await prisma.ambulanceService.create({
      data: req.body
    });

    res.status(201).json({
      status: 'Success',
      message: 'Ambulance service created successfully',
      data: { ambulance }
    });
  } catch (error) {
    next(error);
  }
};

// Update ambulance service (admin only)
const updateAmbulance = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ambulance = await prisma.ambulanceService.update({
      where: { id },
      data: req.body
    });

    if (!ambulance) {
      return res.status(404).json({
        status: 'Error',
        message: 'Ambulance service not found'
      });
    }

    res.json({
      status: 'Success',
      message: 'Ambulance service updated successfully',
      data: { ambulance }
    });
  } catch (error) {
    next(error);
  }
};

// Delete ambulance service (admin only)
const deleteAmbulance = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ambulance = await prisma.ambulanceService.delete({
      where: { id }
    });

    if (!ambulance) {
      return res.status(404).json({
        status: 'Error',
        message: 'Ambulance service not found'
      });
    }

    res.json({
      status: 'Success',
      message: 'Ambulance service deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Verify ambulance service (admin only)
const verifyAmbulance = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ambulance = await prisma.ambulanceService.update({
      where: { id },
      data: {
        verified: true,
        verifiedBy: req.user.id
      }
    });

    if (!ambulance) {
      return res.status(404).json({
        status: 'Error',
        message: 'Ambulance service not found'
      });
    }

    res.json({
      status: 'Success',
      message: 'Ambulance service verified successfully',
      data: { ambulance }
    });
  } catch (error) {
    next(error);
  }
};

// Rate ambulance service
const rateAmbulance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'Error',
        message: 'Rating must be between 1 and 5'
      });
    }

    const ambulance = await prisma.ambulanceService.findUnique({
      where: { id }
    });

    if (!ambulance) {
      return res.status(404).json({
        status: 'Error',
        message: 'Ambulance service not found'
      });
    }

    const currentTotalRating = ambulance.rating * ambulance.totalRatings;
    const newTotalRatings = ambulance.totalRatings + 1;
    const newAverageRating = (currentTotalRating + rating) / newTotalRatings;

    const updatedAmbulance = await prisma.ambulanceService.update({
      where: { id },
      data: {
        rating: newAverageRating,
        totalRatings: newTotalRatings
      }
    });

    res.json({
      status: 'Success',
      message: 'Rating submitted successfully',
      data: { ambulance: updatedAmbulance }
    });
  } catch (error) {
    next(error);
  }
};

// Get ambulance statistics
const getAmbulanceStats = async (req, res, next) => {
  try {
    const [
      totalAmbulances,
      activeAmbulances,
      verifiedAmbulances,
      governmentAmbulances,
      privateAmbulances,
      avgResponseTime
    ] = await Promise.all([
      prisma.ambulanceService.count(),
      prisma.ambulanceService.count({ where: { isActive: true } }),
      prisma.ambulanceService.count({ where: { verified: true } }),
      prisma.ambulanceService.count({ where: { serviceType: 'GOVERNMENT' } }),
      prisma.ambulanceService.count({ where: { serviceType: 'PRIVATE' } }),
      prisma.ambulanceService.aggregate({
        where: { 
          isActive: true, 
          averageResponseTime: { not: null } 
        },
        _avg: { 
          averageResponseTime: true 
        }
      })
    ]);

    res.json({
      status: 'Success',
      message: 'Ambulance statistics retrieved successfully',
      data: {
        totalAmbulances,
        activeAmbulances,
        verifiedAmbulances,
        governmentAmbulances,
        privateAmbulances,
        averageResponseTime: avgResponseTime._avg.averageResponseTime || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get ambulances by district
const getAmbulancesByDistrict = async (req, res, next) => {
  try {
    const districtStats = await prisma.ambulanceService.groupBy({
      by: ['district'],
      where: { isActive: true },
      _count: {
        id: true
      },
      _avg: {
        rating: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    res.json({
      status: 'Success',
      message: 'Ambulance distribution by district retrieved successfully',
      data: districtStats
    });
  } catch (error) {
    next(error);
  }
};

// Search nearby ambulances (geospatial)
const searchNearbyAmbulances = async (req, res, next) => {
  try {
    const { latitude, longitude, radiusKm = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        status: 'Error',
        message: 'Latitude and longitude are required'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Get all ambulances with coordinates
    const ambulances = await prisma.ambulanceService.findMany({
      where: {
        isActive: true,
        verified: true,
        coordinates: { not: null }
      }
    });

    // Calculate distances (simplified version)
    const nearbyAmbulances = ambulances
      .map(ambulance => {
        const coords = ambulance.coordinates;
        if (!coords || !coords.latitude || !coords.longitude) {
          return { ...ambulance, distance: Infinity };
        }

        const distance = calculateDistance(
          lat, lng,
          coords.latitude,
          coords.longitude
        );

        return { ...ambulance, distance };
      })
      .filter(ambulance => ambulance.distance <= parseFloat(radiusKm))
      .sort((a, b) => a.distance - b.distance);

    res.json({
      status: 'Success',
      message: 'Nearby ambulance services retrieved successfully',
      data: {
        ambulances: nearbyAmbulances,
        count: nearbyAmbulances.length,
        searchRadius: parseFloat(radiusKm)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Haversine distance calculation
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
  searchAmbulances,
  getEmergencyAmbulances,
  getAmbulanceById,
  createAmbulance,
  updateAmbulance,
  deleteAmbulance,
  verifyAmbulance,
  rateAmbulance,
  getAmbulanceStats,
  getAmbulancesByDistrict,
  searchNearbyAmbulances
};
