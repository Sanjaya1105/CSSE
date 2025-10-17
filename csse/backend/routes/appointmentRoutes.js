
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
// Analytics: Peak times
router.get('/analytics/peak-times', appointmentController.getPeakTimes);

router.get('/', appointmentController.getAllAppointments); // <-- NEW
router.get('/slots', appointmentController.getAvailableSlots);
router.post('/book', appointmentController.bookAppointment);
router.get('/patient', appointmentController.getPatientAppointments);
router.get('/doctor', appointmentController.getDoctorAppointments);

module.exports = router;
