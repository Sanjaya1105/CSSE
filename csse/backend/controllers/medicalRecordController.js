// @desc    Update a medical record
// @route   PUT /api/medical-records/:id
// @access  Private (Doctor/Admin)
const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, recommendation, medicines, nextDate } = req.body;
    
    // Get existing record to preserve or append files
    const existingRecord = await MedicalRecord.findById(id);
    if (!existingRecord) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }
    
    let updateFields = {
      diagnosis,
      recommendation,
      medicines,
      nextDate
    };
    
    // If new reports are uploaded, append them to existing ones
    if (req.files && req.files.length > 0) {
      const newReportUrls = req.files.map(f => `/uploads/medical-reports/${f.filename}`);
      
      // Append new files to existing ones (comma-separated)
      if (existingRecord.reportUrl) {
        updateFields.reportUrl = existingRecord.reportUrl + ',' + newReportUrls.join(',');
      } else {
        updateFields.reportUrl = newReportUrls.join(',');
      }
    }
    
    const updated = await MedicalRecord.findByIdAndUpdate(id, updateFields, { new: true });
    console.log(`✅ Medical record updated for ID: ${id}`);
    res.status(200).json({ success: true, message: 'Medical record updated', data: updated });
  } catch (error) {
    console.error('Update medical record error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating medical record' });
  }
};
const MedicalRecord = require('../models/MedicalRecord');
const path = require('path');
const fs = require('fs');

// @desc    Save medical record for a patient
// @route   POST /api/medical-records/save
// @access  Private (Doctor)
const saveMedicalRecord = async (req, res) => {
  try {
    const { patientId, patientName, age, diagnosis, recommendation, medicines, nextDate } = req.body;

    // Validate required fields
    if (!patientId || !patientName || !age || !diagnosis || !medicines) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    let reportUrl = '';
    // Handle multiple files
    if (req.files && req.files.length > 0) {
      // Store all file URLs as comma-separated string
      reportUrl = req.files.map(f => `/uploads/medical-reports/${f.filename}`).join(',');
    } else if (req.file) {
      // Fallback for single file (backward compatibility)
      reportUrl = `/uploads/medical-reports/${req.file.filename}`;
    }

    // Create medical record
    const medicalRecord = new MedicalRecord({
      patientId,
      patientName,
      age: parseInt(age),
      diagnosis,
      recommendation: recommendation || '',
      medicines,
      reportUrl,
      nextDate: nextDate || null,
    });

    await medicalRecord.save();

    console.log(`✅ Medical record saved for patient: ${patientName}`);

    res.status(201).json({
      success: true,
      message: 'Medical record saved successfully',
      data: medicalRecord
    });

  } catch (error) {
    console.error('Medical record save error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving medical record'
    });
  }
};

// @desc    Get medical records for a patient
// @route   GET /api/medical-records/patient/:patientId
// @access  Private (Doctor/Admin)
const getPatientMedicalRecords = async (req, res) => {
  try {
    const { patientId } = req.params;

    const records = await MedicalRecord.find({ patientId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });

  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching medical records'
    });
  }
};

// @desc    Get all medical records
// @route   GET /api/medical-records
// @access  Private (Admin)
const getAllMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });

  } catch (error) {
    console.error('Get all medical records error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching medical records'
    });
  }
};

// @desc    Delete a medical record
// @route   DELETE /api/medical-records/:id
// @access  Private (Doctor/Admin)
const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await MedicalRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    // Delete associated file if exists
    if (record.reportUrl) {
      const filePath = path.join(__dirname, '..', record.reportUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await MedicalRecord.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Medical record deleted successfully'
    });

  } catch (error) {
    console.error('Delete medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting medical record'
    });
  }
};

module.exports = {
  saveMedicalRecord,
  getPatientMedicalRecords,
  getAllMedicalRecords,
  deleteMedicalRecord,
  updateMedicalRecord
};

