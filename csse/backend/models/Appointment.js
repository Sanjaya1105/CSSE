const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  age: { type: Number, required: true },
  history: { type: String },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorBooking', required: true },
  doctorName: { type: String, required: true },
  doctorRegisterNumber: { type: String, required: true }, // Doctor's register number
  date: { type: String, required: true }, // YYYY-MM-DD
  slotTime: { type: String, required: true }, // e.g. 08:00
  queueNumber: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  paymentType: { type: String, required: false },
  paymentId: { type: mongoose.Schema.Types.ObjectId, required: false }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
