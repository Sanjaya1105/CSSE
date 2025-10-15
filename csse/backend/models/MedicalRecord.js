const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: [true, 'Patient ID is required'],
    trim: true
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: 0
  },
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required'],
    trim: true
  },
  recommendation: {
    type: String,
    trim: true,
    default: ''
  },
  medicines: {
    type: String,
    required: [true, 'Medicines are required'],
    trim: true
  },
  reportUrl: {
    type: String,
    default: ''
  },
  nextDate: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);

