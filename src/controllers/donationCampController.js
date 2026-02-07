const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create donation camp
const createDonationCamp = async (req, res, next) => {
  try {
    const {
      title,
      description,
      organizer,
      venue,
      address,
      city,
      district,
      state,
      pincode,
      startDate,
      endDate,
      startTime,
      endTime,
      targetDonations,
      contactPerson,
      contactPersonPhone,
      contactPersonEmail
    } = req.body;

    const camp = await prisma.donationCamp.create({
      data: {
        title,
        description,
        organizer,
        venue,
        address,
        city,
        district,
        state,
        pincode,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime,
        endTime,
        targetDonations: parseInt(targetDonations),
        contactPerson,
        contactPersonPhone,
        contactPersonEmail,
        status: 'UPCOMING',
        createdBy: req.user.id
      }
    });

    res.status(201).json({
      status: 'Success',
      message: 'Donation camp created successfully',
      data: camp
    });
  } catch (error) {
    next(error);
  }
};

// Get all donation camps
const getDonationCamps = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [camps, total] = await Promise.all([
      prisma.donationCamp.findMany({
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
        include: {
          creator: {
            select: { name: true, email: true }
          }
        }
      }),
      prisma.donationCamp.count()
    ]);

    res.json({
      status: 'Success',
      message: 'Donation camps retrieved successfully',
      data: camps,
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

// Get donation camp by ID
const getDonationCampById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const camp = await prisma.donationCamp.findUnique({
      where: { id },
      include: {
        creator: {
          select: { name: true, email: true }
        }
      }
    });

    if (!camp) {
      return res.status(404).json({
        status: 'Error',
        message: 'Donation camp not found'
      });
    }

    res.json({
      status: 'Success',
      message: 'Donation camp retrieved successfully',
      data: camp
    });
  } catch (error) {
    next(error);
  }
};

// Update donation camp
const updateDonationCamp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert date strings to Date objects
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    const camp = await prisma.donationCamp.update({
      where: { id },
      data: updateData
    });

    res.json({
      status: 'Success',
      message: 'Donation camp updated successfully',
      data: camp
    });
  } catch (error) {
    next(error);
  }
};

// Delete donation camp
const deleteDonationCamp = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.donationCamp.delete({
      where: { id }
    });

    res.json({
      status: 'Success',
      message: 'Donation camp deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get upcoming camps
const getUpcomingCamps = async (req, res, next) => {
  try {
    const camps = await prisma.donationCamp.findMany({
      where: {
        status: 'UPCOMING',
        startDate: {
          gte: new Date()
        }
      },
      orderBy: { startDate: 'asc' },
      include: {
        creator: {
          select: { name: true, email: true }
        }
      }
    });

    res.json({
      status: 'Success',
      message: 'Upcoming camps retrieved successfully',
      data: camps
    });
  } catch (error) {
    next(error);
  }
};

// Get camp statistics
const getCampStats = async (req, res, next) => {
  try {
    const stats = await prisma.donationCamp.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    res.json({
      status: 'Success',
      message: 'Camp statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDonationCamp,
  getDonationCamps,
  getDonationCampById,
  updateDonationCamp,
  deleteDonationCamp,
  getUpcomingCamps,
  getCampStats
};
