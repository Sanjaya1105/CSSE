const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.get('/slots', appointmentController.getAvailableSlots);
router.post('/book', appointmentController.bookAppointment);
router.get('/patient', appointmentController.getPatientAppointments);

module.exports = router;
