const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');

// GET all staff
router.get('/', async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch staff data' });
  }
});

module.exports = router;
