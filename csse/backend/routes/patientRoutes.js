const express = require('express');
const router = express.Router();
const { 
  getPatientById, 
  getPendingRequests, 
  clearPendingRequest,
  getPatientByIdForAdmin,
  getAdminPendingRequests,
  clearAdminPendingRequest,
  searchPatients,
  findPatientByNameAndAge
} = require('../controllers/patientController');

// Find patient by name and age
router.get('/find', findPatientByNameAndAge);
// Search patients (must be before /:id routes to avoid conflicts)
router.get('/search', searchPatients);

// Admin-specific routes (must be before /:id routes to avoid conflicts)
// Get pending admin patient requests
router.get('/admin/pending/requests', getAdminPendingRequests);

// Clear an admin pending request
router.delete('/admin/pending/:requestId', clearAdminPendingRequest);

// Admin patient lookup
router.post('/adminview/:id', getPatientByIdForAdmin);
router.get('/adminview/:id', getPatientByIdForAdmin);

// Doctor-specific routes
// Get pending patient requests
router.get('/pending/requests', getPendingRequests);

// Clear a pending request
router.delete('/pending/:requestId', clearPendingRequest);

// POST: Send patient lookup request (for Postman)
router.post('/:id', getPatientById);

// GET: Send patient lookup request (for QR code scanners that open URLs)
router.get('/:id', getPatientById);

module.exports = router;

