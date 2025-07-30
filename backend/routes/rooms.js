const express = require('express');
const { body, validationResult } = require('express-validator');
const Room = require('../models/Room');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/rooms
// @desc    Get all rooms (with optional filtering)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type, minPrice, maxPrice, available, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (type) filter.type = type;
    if (available === 'true') filter.isAvailable = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get rooms with pagination
    const rooms = await Room.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count for pagination
    const total = await Room.countDocuments(filter);
    
    res.json({
      success: true,
      data: rooms,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching rooms' 
    });
  }
});

// @route   GET /api/rooms/:id
// @desc    Get single room by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ 
        success: false,
        message: 'Room not found' 
      });
    }

    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching room' 
    });
  }
});

// @route   POST /api/rooms
// @desc    Create a new room
// @access  Private/Admin
router.post('/', protect, admin, [
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('type').isIn(['Single', 'Double', 'Suite', 'Deluxe', 'Presidential']).withMessage('Invalid room type'),
  body('capacity').isInt({ min: 1, max: 10 }).withMessage('Capacity must be between 1 and 10'),
  body('floor').isInt({ min: 1 }).withMessage('Floor must be a positive number'),
  body('roomNumber').notEmpty().withMessage('Room number is required'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required')
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

    const room = await Room.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room
    });
  } catch (error) {
    console.error('Create room error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Room number already exists' 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Server error while creating room' 
    });
  }
});

// @route   PUT /api/rooms/:id
// @desc    Update a room
// @access  Private/Admin
router.put('/:id', protect, admin, [
  body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('type').optional().isIn(['Single', 'Double', 'Suite', 'Deluxe', 'Presidential']).withMessage('Invalid room type'),
  body('capacity').optional().isInt({ min: 1, max: 10 }).withMessage('Capacity must be between 1 and 10'),
  body('floor').optional().isInt({ min: 1 }).withMessage('Floor must be a positive number'),
  body('roomNumber').optional().notEmpty().withMessage('Room number is required')
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

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({ 
        success: false,
        message: 'Room not found' 
      });
    }

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: room
    });
  } catch (error) {
    console.error('Update room error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Room number already exists' 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating room' 
    });
  }
});

// @route   DELETE /api/rooms/:id
// @desc    Delete a room
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({ 
        success: false,
        message: 'Room not found' 
      });
    }

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while deleting room' 
    });
  }
});

// @route   PUT /api/rooms/:id/availability
// @desc    Toggle room availability
// @access  Private/Admin
router.put('/:id/availability', protect, admin, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ 
        success: false,
        message: 'Room not found' 
      });
    }

    room.isAvailable = !room.isAvailable;
    await room.save();

    res.json({
      success: true,
      message: `Room ${room.isAvailable ? 'marked as available' : 'marked as unavailable'}`,
      data: room
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating room availability' 
    });
  }
});

module.exports = router; 