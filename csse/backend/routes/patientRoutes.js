const express = require('express');
const router = express.Router();
const { getPatientById, getPendingRequests, clearPendingRequest } = require('../controllers/patientController');

// Get pending patient requests
router.get('/pending/requests', getPendingRequests);

// Clear a pending request
router.delete('/pending/:requestId', clearPendingRequest);

// POST: Send patient lookup request (for Postman)
router.post('/:id', getPatientById);

// GET: Send patient lookup request (for QR code scanners that open URLs)
router.get('/:id', getPatientById);

module.exports = router;

