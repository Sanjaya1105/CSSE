const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6
  },
  nic: {
    type: String,
    required: [true, 'Please add NIC'],
    unique: true
  },
  specialization: {
    type: String,
    required: [true, 'Please add specialization']
  },
  registerNumber: {
    type: String,
    required: [true, 'Please add register number'],
    unique: true
  },
  userType: {
    type: String,
    default: 'doctor'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);

