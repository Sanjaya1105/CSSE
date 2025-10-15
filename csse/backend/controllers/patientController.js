const Patient = require('../models/Patient');

// In-memory storage for pending patient lookup requests
let pendingRequests = [];

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

module.exports = { getPatientById, getPendingRequests, clearPendingRequest };

