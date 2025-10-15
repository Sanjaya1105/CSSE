const Channel = require('../models/Channel');
const path = require('path');
const fs = require('fs');

// Save channel details for an appointment
exports.saveChannelDetails = async (req, res) => {
  try {
    const { appointmentId, patientName, age, details, medicine, nextDate } = req.body;
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
