const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

// Create doctor
router.post('/', doctorController.createDoctor);
// Get all doctors
router.get('/', doctorController.getDoctors);
// Update doctor
router.put('/:id', doctorController.updateDoctor);
// Delete doctor
router.delete('/:id', doctorController.deleteDoctor);

module.exports = router;
