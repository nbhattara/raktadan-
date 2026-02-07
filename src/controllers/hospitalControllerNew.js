const { PrismaClient } = require('@prisma/client');
const config = require('../config');

const prisma = new PrismaClient();

// Get all hospitals
const getHospitals = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      district,
      city,
      type,
      hasBloodBank,
      emergencyServices
    } = req.query;

    const where = {
      isActive: true,
      isVerified: true
    };

    if (district) {
      where.district = district;
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (type) {
      where.type = type;
    }

    if (hasBloodBank !== undefined) {
      where.bloodBankAvailable = hasBloodBank === 'true';
    }

    if (emergencyServices !== undefined) {
      where.emergencyServices = emergencyServices === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [hospitals, total] = await Promise.all([
      prisma.hospital.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          district: true,
          pincode: true,
          type: true,
          capacity: true,
          bloodBankAvailable: true,
          emergencyServices: true,
          coordinates: true,
          isActive: true,
          isVerified: true
        }
      }),
      prisma.hospital.count({ where })
    ]);

    res.json({
      status: 'Success',
      message: 'Hospitals retrieved successfully',
      data: {
        hospitals,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get hospital by ID
const getHospitalById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hospital = await prisma.hospital.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        district: true,
        pincode: true,
        type: true,
        licenseNumber: true,
        capacity: true,
        bloodBankAvailable: true,
        emergencyServices: true,
        coordinates: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!hospital) {
      return res.status(404).json({
        status: 'Error',
        message: 'Hospital not found'
      });
    }

    res.json({
      status: 'Success',
      message: 'Hospital retrieved successfully',
      data: hospital
    });
  } catch (error) {
    next(error);
  }
};

// Search hospitals
const searchHospitals = async (req, res, next) => {
  try {
    const {
      query,
      district,
      bloodBank,
      emergency,
      page = 1,
      limit = 20
    } = req.query;

    const where = {
      isActive: true,
      isVerified: true
    };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } }
      ];
    }

    if (district) {
      where.district = district;
    }

    if (bloodBank !== undefined) {
      where.bloodBankAvailable = bloodBank === 'true';
    }

    if (emergency !== undefined) {
      where.emergencyServices = emergency === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [hospitals, total] = await Promise.all([
      prisma.hospital.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          district: true,
          pincode: true,
          type: true,
          capacity: true,
          bloodBankAvailable: true,
          emergencyServices: true,
          coordinates: true
        }
      }),
      prisma.hospital.count({ where })
    ]);

    res.json({
      status: 'Success',
      message: 'Hospital search completed successfully',
      data: {
        hospitals,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get hospitals by district
const getHospitalsByDistrict = async (req, res, next) => {
  try {
    const { district } = req.params;

    const hospitals = await prisma.hospital.findMany({
      where: {
        district,
        isActive: true,
        isVerified: true
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        district: true,
        pincode: true,
        type: true,
        capacity: true,
        bloodBankAvailable: true,
        emergencyServices: true,
        coordinates: true
      }
    });

    res.json({
      status: 'Success',
      message: `Hospitals in ${district} retrieved successfully`,
      data: hospitals
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHospitals,
  getHospitalById,
  searchHospitals,
  getHospitalsByDistrict
};
