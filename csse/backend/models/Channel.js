const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  patientName: { type: String, required: true },
  age: { type: Number, required: true },
  details: { type: String, required: true },
  medicine: { type: String, required: true },
  reportUrl: { type: String },
  nextDate: { type: String }, // YYYY-MM-DD
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Channel', channelSchema);
