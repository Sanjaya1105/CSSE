const Patient = require('../models/Patient');

// In-memory storage for pending patient lookup requests (for doctors)
let pendingRequests = [];

// In-memory storage for pending admin patient lookup requests
let adminPendingRequests = [];

// @desc    Send patient lookup request
// @route   POST /api/patient/:id or GET /api/patient/:id
// @access  Public
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find patient by ID or ID card number
    let patient = await Patient.findById(id).select('-password');
    
    // If not found by _id, try by idCardNumber
    if (!patient) {
      patient = await Patient.findOne({ idCardNumber: id }).select('-password');
    }

    if (!patient) {
      console.log(`Patient not found for ID: ${id}`);
      return res.status(200).json({
        success: false,
        message: 'Request received'
      });
    }

    // Add to pending requests queue for doctor to confirm
    const requestId = Date.now().toString();
    pendingRequests.push({
      id: requestId,
      patientData: patient,
      timestamp: new Date()
    });

    // Clean old requests (older than 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    pendingRequests = pendingRequests.filter(req => req.timestamp > fiveMinutesAgo);

    console.log(`✅ Patient lookup request received for: ${patient.name} (ID: ${id})`);
    console.log(`📊 Total pending requests: ${pendingRequests.length}`);

    // Simple acknowledgment - no patient data in response
    res.status(200).json({
      success: true,
      message: 'Request received'
    });

  } catch (error) {
    console.error('Patient lookup error:', error);
    res.status(200).json({
      success: false,
      message: 'Request received'
    });
  }
};

// @desc    Get pending patient requests (for doctor to review)
// @route   GET /api/patient/pending/requests
// @access  Private (Doctor)
const getPendingRequests = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      requests: pendingRequests
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Clear a pending request
// @route   DELETE /api/patient/pending/:requestId
// @access  Private (Doctor)
const clearPendingRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    pendingRequests = pendingRequests.filter(req => req.id !== requestId);
    
    res.status(200).json({
      success: true,
      message: 'Request cleared'
    });
  } catch (error) {
    console.error('Clear request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Send patient lookup request for admin
// @route   POST /api/patient/adminview/:id or GET /api/patient/adminview/:id
// @access  Public
const getPatientByIdForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Find patient by ID or ID card number
    let patient = await Patient.findById(id).select('-password');
    
    // If not found by _id, try by idCardNumber
    if (!patient) {
      patient = await Patient.findOne({ idCardNumber: id }).select('-password');
    }

    if (!patient) {
      console.log(`Patient not found for ID: ${id}`);
      return res.status(200).json({
        success: false,
        message: 'Request received'
      });
    }

    // Add to pending admin requests queue
    const requestId = Date.now().toString();
    adminPendingRequests.push({
      id: requestId,
      patientData: patient,
      timestamp: new Date()
    });

    // Clean old requests (older than 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    adminPendingRequests = adminPendingRequests.filter(req => req.timestamp > fiveMinutesAgo);

    console.log(`✅ Admin patient lookup request received for: ${patient.name} (ID: ${id})`);
    console.log(`📊 Total admin pending requests: ${adminPendingRequests.length}`);

    // Simple acknowledgment - no patient data in response
    res.status(200).json({
      success: true,
      message: 'Request received'
    });

  } catch (error) {
    console.error('Admin patient lookup error:', error);
    res.status(200).json({
      success: false,
      message: 'Request received'
    });
  }
};

// @desc    Get pending admin patient requests
// @route   GET /api/patient/admin/pending/requests
// @access  Private (Admin)
const getAdminPendingRequests = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      requests: adminPendingRequests
    });
  } catch (error) {
    console.error('Get admin pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Clear an admin pending request
// @route   DELETE /api/patient/admin/pending/:requestId
// @access  Private (Admin)
const clearAdminPendingRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    adminPendingRequests = adminPendingRequests.filter(req => req.id !== requestId);
    
    res.status(200).json({
      success: true,
      message: 'Request cleared'
    });
  } catch (error) {
    console.error('Clear admin request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Search patients by name or ID card number
// @route   GET /api/patient/search?query=searchTerm
// @access  Private (Admin)
const searchPatients = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Search by name (case-insensitive) or ID card number
    const patients = await Patient.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { idCardNumber: { $regex: query, $options: 'i' } }
      ]
    }).select('-password').limit(10);

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });

  } catch (error) {
    console.error('Search patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching patients'
    });
  }
};

module.exports = { 
  getPatientById, 
  getPendingRequests, 
  clearPendingRequest,
  getPatientByIdForAdmin,
  getAdminPendingRequests,
  clearAdminPendingRequest,
  searchPatients
};

