const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Room title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Room description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Room price is required'],
    min: [0, 'Price cannot be negative']
  },
  type: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['Single', 'Double', 'Suite', 'Deluxe', 'Presidential'],
    default: 'Single'
  },
  capacity: {
    type: Number,
    required: [true, 'Room capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [10, 'Capacity cannot exceed 10']
  },
  amenities: [{
    type: String,
    enum: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Room Service', 'Balcony', 'Ocean View', 'Mountain View', 'Kitchen', 'Jacuzzi']
  }],
  images: [{
    type: String,
    required: [true, 'At least one image is required']
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  floor: {
    type: Number,
    required: [true, 'Floor number is required'],
    min: [1, 'Floor must be at least 1']
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
roomSchema.index({ type: 1, price: 1, isAvailable: 1 });

module.exports = mongoose.model('Room', roomSchema); 