const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { protect, admin, user } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', protect, user, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // Build filter object
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get bookings with pagination
    const bookings = await Booking.find(filter)
      .populate('room', 'title images price type')
      .sort({ bookingDate: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count for pagination
    const total = await Booking.countDocuments(filter);
    
    res.json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching bookings' 
    });
  }
});

// @route   GET /api/bookings/admin
// @desc    Get all bookings (Admin only)
// @access  Private/Admin
router.get('/admin', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get bookings with pagination
    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .populate('room', 'title roomNumber type price')
      .sort({ bookingDate: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count for pagination
    const total = await Booking.countDocuments(filter);
    
    res.json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get admin bookings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching bookings' 
    });
  }
});

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', protect, user, [
  body('roomId').isMongoId().withMessage('Valid room ID is required'),
  body('checkIn').isISO8601().withMessage('Valid check-in date is required'),
  body('checkOut').isISO8601().withMessage('Valid check-out date is required'),
  body('guests').isInt({ min: 1, max: 10 }).withMessage('Number of guests must be between 1 and 10'),
  body('specialRequests').optional().isLength({ max: 500 }).withMessage('Special requests cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error',
        errors: errors.array() 
      });
    }

    const { roomId, checkIn, checkOut, guests, specialRequests } = req.body;

    // Check if room exists and is available
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ 
        success: false,
        message: 'Room not found' 
      });
    }

    if (!room.isAvailable) {
      return res.status(400).json({ 
        success: false,
        message: 'Room is not available' 
      });
    }

    // Check if room capacity is sufficient
    if (guests > room.capacity) {
      return res.status(400).json({ 
        success: false,
        message: `Room capacity is ${room.capacity} guests. You selected ${guests} guests.` 
      });
    }

    // Check date validity
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({ 
        success: false,
        message: 'Check-in date cannot be in the past' 
      });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ 
        success: false,
        message: 'Check-out date must be after check-in date' 
      });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      room: roomId,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({ 
        success: false,
        message: 'Room is not available for the selected dates' 
      });
    }

    // Calculate total amount
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalAmount = room.price * nights;

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      room: roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalAmount,
      specialRequests
    });

    // Populate room details
    await booking.populate('room', 'title images price type');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while creating booking' 
    });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status (Admin only)
// @access  Private/Admin
router.put('/:id/status', protect, admin, [
  body('status').isIn(['Pending', 'Approved', 'Rejected']).withMessage('Invalid status'),
  body('adminNotes').optional().isLength({ max: 500 }).withMessage('Admin notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error',
        errors: errors.array() 
      });
    }

    const { status, adminNotes } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        adminNotes,
        ...(status === 'Approved' && { paymentStatus: 'Paid' })
      },
      { new: true }
    ).populate('user', 'name email phone')
     .populate('room', 'title roomNumber type price');

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    res.json({
      success: true,
      message: `Booking ${status.toLowerCase()} successfully`,
      data: booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating booking status' 
    });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Cancel a booking
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    // Check if user owns the booking or is admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to cancel this booking' 
      });
    }

    // Check if booking can be cancelled (not already cancelled and check-in is in the future)
    if (booking.status === 'Cancelled') {
      return res.status(400).json({ 
        success: false,
        message: 'Booking is already cancelled' 
      });
    }

    const today = new Date();
    if (new Date(booking.checkIn) <= today) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot cancel booking after check-in date' 
      });
    }

    booking.status = 'Cancelled';
    booking.paymentStatus = 'Refunded';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while cancelling booking' 
    });
  }
});

// @route   GET /api/bookings/stats
// @desc    Get booking statistics (Admin only)
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
    const approvedBookings = await Booking.countDocuments({ status: 'Approved' });
    const rejectedBookings = await Booking.countDocuments({ status: 'Rejected' });
    const cancelledBookings = await Booking.countDocuments({ status: 'Cancelled' });

    // Calculate total revenue from approved bookings
    const revenueResult = await Booking.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.json({
      success: true,
      data: {
        totalBookings,
        pendingBookings,
        approvedBookings,
        rejectedBookings,
        cancelledBookings,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching booking statistics' 
    });
  }
});

module.exports = router; 