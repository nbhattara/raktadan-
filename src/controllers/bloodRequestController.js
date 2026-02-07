const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create blood request
const createBloodRequest = async (req, res, next) => {
  try {
    const {
      patientName,
      patientAge,
      patientGender,
      bloodGroup,
      unitsRequired,
      urgency,
      hospitalName,
      hospitalAddress,
      hospitalCity,
      hospitalState,
      hospitalPincode,
      hospitalPhone,
      doctorName,
      doctorPhone,
      medicalReason,
      contactPerson,
      contactPersonPhone,
      requiredBy
    } = req.body;

    const bloodRequest = await prisma.bloodRequest.create({
      data: {
        patientName,
        patientAge: parseInt(patientAge),
        patientGender,
        bloodGroup,
        unitsRequired: parseInt(unitsRequired),
        urgency,
        hospitalName,
        hospitalAddress,
        hospitalCity,
        hospitalState,
        hospitalPincode,
        hospitalPhone,
        doctorName,
        doctorPhone,
        medicalReason,
        contactPerson,
        contactPersonPhone,
        requiredBy: new Date(requiredBy),
        status: 'PENDING',
        userId: req.user?.id || 'anonymous'
      }
    });

    // TODO: Send notifications to matching donors
    // await sendNotification({
    //   type: 'BLOOD_REQUEST',
    //   bloodGroup,
    //   urgency,
    //   location: hospitalCity
    // });

    res.status(201).json({
      status: 'Success',
      message: 'Blood request created successfully',
      data: bloodRequest
    });
  } catch (error) {
    next(error);
  }
};

// Get all blood requests
const getBloodRequests = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      prisma.bloodRequest.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          requester: {
            select: { name: true, email: true, phone: true }
          }
        }
      }),
      prisma.bloodRequest.count()
    ]);

    res.json({
      status: 'Success',
      message: 'Blood requests retrieved successfully',
      data: requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get blood request by ID
const getBloodRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await prisma.bloodRequest.findUnique({
      where: { id },
      include: {
        requester: {
          select: { name: true, email: true, phone: true }
        }
      }
    });

    if (!request) {
      return res.status(404).json({
        status: 'Error',
        message: 'Blood request not found'
      });
    }

    res.json({
      status: 'Success',
      message: 'Blood request retrieved successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// Update blood request status
const updateBloodRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await prisma.bloodRequest.update({
      where: { id },
      data: { status }
    });

    res.json({
      status: 'Success',
      message: 'Blood request status updated successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// Respond to blood request
const respondToBloodRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    // Create response record
    const donationResponse = await prisma.donationResponse.create({
      data: {
        bloodRequestId: id,
        userId: req.user.id,
        response,
        status: 'PENDING'
      }
    });

    res.json({
      status: 'Success',
      message: 'Response submitted successfully',
      data: donationResponse
    });
  } catch (error) {
    next(error);
  }
};

// Get blood requests by blood group
const getBloodRequestsByBloodGroup = async (req, res, next) => {
  try {
    const { bloodGroup } = req.query;

    const requests = await prisma.bloodRequest.findMany({
      where: { bloodGroup },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        }
      }
    });

    res.json({
      status: 'Success',
      message: 'Blood requests retrieved successfully',
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// Get blood request statistics
const getBloodRequestStats = async (req, res, next) => {
  try {
    const stats = await prisma.bloodRequest.groupBy({
      by: ['status', 'urgency', 'bloodGroup'],
      _count: { id: true }
    });

    res.json({
      status: 'Success',
      message: 'Blood request statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateBloodRequestStatus,
  respondToBloodRequest,
  getBloodRequestsByBloodGroup,
  getBloodRequestStats
};
