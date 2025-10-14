const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
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
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  idCardNumber: {
    type: String,
    required: [true, 'Please add ID card number'],
    unique: true
  },
  age: {
    type: Number,
    required: [true, 'Please add age'],
    min: 0
  },
  userType: {
    type: String,
    default: 'patient'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);

