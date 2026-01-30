const { PrismaClient } = require('@prisma/client');
const config = require('../config');

const prisma = new PrismaClient();

// Create blood request
const createBloodRequest = async (req, res, next) => {
  try {
    const bloodRequest = await prisma.bloodRequest.create({
      data: {
        ...req.body,
        requestedBy: req.user.id
      }
    });

    // Populate requester info
    const populatedRequest = await prisma.bloodRequest.findUnique({
      where: { id: bloodRequest.id },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.status(201).json({
      status: 'Success',
      message: 'Blood request created successfully',
      data: { bloodRequest: populatedRequest }
    });
  } catch (error) {
    next(error);
  }
};

// Get blood requests
const getBloodRequests = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      bloodGroup,
      city,
      status,
      urgency
    } = req.query;

    const where = {};

    if (bloodGroup) {
      where.bloodGroup = bloodGroup;
    }

    if (city) {
      where.hospitalCity = { contains: city, mode: 'insensitive' };
    }

    if (status) {
      where.status = status;
    } else {
      where.status = { in: ['PENDING', 'APPROVED'] };
    }

    if (urgency) {
      where.urgency = urgency;
    }

    // Non-admin users can only see their own requests
    if (req.user.role !== 'ADMIN') {
      where.requestedBy = req.user.id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bloodRequests, total] = await Promise.all([
      prisma.bloodRequest.findMany({
        where,
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: [
          { urgency: 'desc' },
          { requestDate: 'desc' }
        ],
        skip,
        take: parseInt(limit)
      }),
      prisma.bloodRequest.count({ where })
    ]);

    res.json({
      status: 'Success',
      message: 'Blood requests retrieved successfully',
      data: {
        bloodRequests,
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

// Search blood requests (public)
const searchBloodRequests = async (req, res, next) => {
  try {
    const { bloodGroup, city, page = 1, limit = 10 } = req.query;

    if (!bloodGroup || !city) {
      return res.status(400).json({
        status: 'Error',
        message: 'Blood group and city are required'
      });
    }

    const where = {
      bloodGroup,
      hospitalCity: { contains: city, mode: 'insensitive' },
      status: { in: ['PENDING', 'APPROVED'] },
      requiredBy: { gt: new Date() }
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bloodRequests, total] = await Promise.all([
      prisma.bloodRequest.findMany({
        where,
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: [
          { urgency: 'desc' },
          { requestDate: 'desc' }
        ],
        skip,
        take: parseInt(limit)
      }),
      prisma.bloodRequest.count({ where })
    ]);

    res.json({
      status: 'Success',
      message: 'Blood requests search completed',
      data: {
        bloodRequests,
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

// Respond to blood request
const respondToBloodRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { message } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        isDonor: true,
        isAvailable: true,
        bloodGroup: true
      }
    });

    if (!user.isDonor || !user.isAvailable) {
      return res.status(400).json({
        status: 'Error',
        message: 'You must be an available donor to respond to blood requests'
      });
    }

    const bloodRequest = await prisma.bloodRequest.findUnique({
      where: { id: requestId }
    });

    if (!bloodRequest) {
      return res.status(404).json({
        status: 'Error',
        message: 'Blood request not found'
      });
    }

    if (!['PENDING', 'APPROVED'].includes(bloodRequest.status)) {
      return res.status(400).json({
        status: 'Error',
        message: 'This blood request is no longer accepting responses'
      });
    }

    if (bloodRequest.bloodGroup !== user.bloodGroup) {
      return res.status(400).json({
        status: 'Error',
        message: 'Your blood group does not match the required blood group'
      });
    }

    // Check if already responded
    if (bloodRequest.donorsResponded.includes(user.id)) {
      return res.status(400).json({
        status: 'Error',
        message: 'You have already responded to this blood request'
      });
    }

    // Add donor to responded list
    const updatedRequest = await prisma.bloodRequest.update({
      where: { id: requestId },
      data: {
        donorsResponded: {
          push: user.id
        }
      }
    });

    res.json({
      status: 'Success',
      message: 'Response submitted successfully',
      data: { bloodRequest: updatedRequest }
    });
  } catch (error) {
    next(error);
  }
};

// Update blood request status (admin/hospital only)
const updateBloodRequestStatus = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { status, unitsFulfilled } = req.body;

    const bloodRequest = await prisma.bloodRequest.findUnique({
      where: { id: requestId }
    });

    if (!bloodRequest) {
      return res.status(404).json({
        status: 'Error',
        message: 'Blood request not found'
      });
    }

    const updateData = { status };

    if (unitsFulfilled !== undefined) {
      updateData.unitsFulfilled = Math.min(unitsFulfilled, bloodRequest.unitsRequired);
    }

    const updatedRequest = await prisma.bloodRequest.update({
      where: { id: requestId },
      data: updateData
    });

    res.json({
      status: 'Success',
      message: 'Blood request status updated successfully',
      data: { bloodRequest: updatedRequest }
    });
  } catch (error) {
    next(error);
  }
};

// Get blood request statistics
const getBloodRequestStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      fulfilledRequests,
      requestsThisMonth,
      urgentRequests
    ] = await Promise.all([
      prisma.bloodRequest.count(),
      prisma.bloodRequest.count({ where: { status: 'PENDING' } }),
      prisma.bloodRequest.count({ where: { status: 'APPROVED' } }),
      prisma.bloodRequest.count({ where: { status: 'FULFILLED' } }),
      prisma.bloodRequest.count({
        where: {
          requestDate: { gte: startOfMonth }
        }
      }),
      prisma.bloodRequest.count({ where: { urgency: 'CRITICAL' } })
    ]);

    res.json({
      status: 'Success',
      message: 'Blood request statistics retrieved successfully',
      data: {
        totalRequests,
        pendingRequests,
        approvedRequests,
        fulfilledRequests,
        requestsThisMonth,
        urgentRequests
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get blood requests by blood group
const getBloodRequestsByBloodGroup = async (req, res, next) => {
  try {
    const bloodGroupStats = await prisma.bloodRequest.groupBy({
      by: ['bloodGroup'],
      where: {
        requestDate: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Last 30 days
        }
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

    res.json({
      status: 'Success',
      message: 'Blood requests by blood group retrieved successfully',
      data: bloodGroupStats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBloodRequest,
  getBloodRequests,
  searchBloodRequests,
  respondToBloodRequest,
  updateBloodRequestStatus,
  getBloodRequestStats,
  getBloodRequestsByBloodGroup
};
