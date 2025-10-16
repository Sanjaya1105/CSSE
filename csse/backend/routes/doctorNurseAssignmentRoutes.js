
const express = require('express');
const router = express.Router();
const DoctorNurseAssignment = require('../models/DoctorNurseAssignment');

// Get assignments for room and week range
// Get assignments for room, week range, and optionally timeSlot
router.get('/by-room-week', async (req, res) => {
  try {
    const { roomNo, weekStartDay, weekEndDay, timeSlot } = req.query;
    let query = {};
    if (timeSlot && weekStartDay && weekEndDay) {
      // Check all assignments for this timeSlot and week, across all rooms
      query = { timeSlot, weekStartDay, weekEndDay };
    } else if (roomNo && weekStartDay && weekEndDay) {
      // Fallback: filter by room and week
      query = { roomNo, weekStartDay, weekEndDay };
    }
    const assignments = await DoctorNurseAssignment.find(query);
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Save doctor-nurse assignment
router.post('/', async (req, res) => {
  try {
    const { doctorId, doctorName, nurseId, nurseName, roomNo, weekStartDay, weekEndDay, timeSlot } = req.body;
    const assignment = await DoctorNurseAssignment.create({
      doctorId,
      doctorName,
      nurseId,
      nurseName,
      roomNo,
      weekStartDay,
      weekEndDay,
      timeSlot
    });
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save assignment' });
  }
});

// Get all assignments, or filter by nurseId
router.get('/', async (req, res) => {
  try {
    const { nurseId } = req.query;
    let query = {};
    if (nurseId) {
      query.nurseId = nurseId;
    }
    const assignments = await DoctorNurseAssignment.find(query);
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Delete nurse assignment by _id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await DoctorNurseAssignment.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

module.exports = router;
