const express = require('express');
const router = express.Router();
const DoctorBooking = require('../models/DoctorBooking');

// GET timetable for a room number
router.get('/:roomNo', async (req, res) => {
  try {
    const bookings = await DoctorBooking.find({ roomNo: req.params.roomNo });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
});

module.exports = router;
