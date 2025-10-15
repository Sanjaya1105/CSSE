const mongoose = require('mongoose');

const doctorBookingSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  doctorName: {
    type: String,
    required: true,
    trim: true
  },
  roomNo: {
    type: String,
    required: true,
    trim: true
  },
  bookingDay: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DoctorBooking', doctorBookingSchema);
