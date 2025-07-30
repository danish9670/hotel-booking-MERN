const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room is required']
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'At least 1 guest is required'],
    max: [10, 'Maximum 10 guests allowed']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Pending'
  },
  specialRequests: {
    type: String,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Refunded'],
    default: 'Pending'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  adminNotes: {
    type: String,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for better query performance
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ room: 1, checkIn: 1, checkOut: 1 });

// Virtual for calculating number of nights
bookingSchema.virtual('nights').get(function() {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  return Math.round(Math.abs((this.checkOut - this.checkIn) / oneDay));
});

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

// Pre-save middleware to calculate total amount
bookingSchema.pre('save', async function(next) {
  if (this.isModified('checkIn') || this.isModified('checkOut') || this.isModified('room')) {
    try {
      const Room = mongoose.model('Room');
      const room = await Room.findById(this.room);
      if (room) {
        const nights = this.nights;
        this.totalAmount = room.price * nights;
      }
    } catch (error) {
      next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema); 