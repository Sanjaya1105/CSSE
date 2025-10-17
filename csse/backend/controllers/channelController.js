const Channel = require('../models/Channel');
const path = require('path');
const fs = require('fs');

// Save channel details for an appointment
exports.saveChannelDetails = async (req, res) => {
  try {
  const { appointmentId, patientName, age, details, medicine, nextDate, recommendation } = req.body;
    let reportUrl = '';
    if (req.file) {
      reportUrl = `/uploads/reports/${req.file.filename}`;
    }
    const channel = new Channel({
      appointmentId,
      patientName,
      age,
      details,
      medicine,
      reportUrl,
      nextDate
    });
    await channel.save();

    // Update appointment status to 'Channeled'
    const Appointment = require('../models/Appointment');
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status: 'Channeled' }, { new: true });

    // Create a medical record for the patient
    if (appointment) {
      const MedicalRecord = require('../models/MedicalRecord');
      const Patient = require('../models/Patient');
      // Try to match by name, age, and idCardNumber if available
      let patient = await Patient.findOne({ name: appointment.patientName, age: appointment.age });
      if (!patient && req.body.idCardNumber) {
        patient = await Patient.findOne({ idCardNumber: req.body.idCardNumber });
      }
      const patientId = patient ? patient._id.toString() : undefined;
      if (!patientId) {
        console.warn('No patient found for medical record creation:', appointment.patientName, appointment.age);
      }
      await MedicalRecord.create({
        patientId: patientId || appointment.patientName, // fallback to name if not found
        patientName: appointment.patientName,
        age: appointment.age,
        diagnosis: details,
        recommendation: recommendation || '',
        medicines: medicine,
        reportUrl,
        nextDate
      });
    }
    res.json({ success: true, channel });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get channel history for a patient by name
exports.getChannelHistory = async (req, res) => {
  try {
    const { patientName } = req.query;
    if (!patientName) return res.status(400).json({ error: 'patientName required' });
    const history = await Channel.find({ patientName }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
