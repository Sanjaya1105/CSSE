const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const medicalRecordController = require('../controllers/medicalRecordController');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads/medical-reports');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer for report uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'medical-report-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - only allow PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

// Routes
router.post('/save', upload.single('report'), medicalRecordController.saveMedicalRecord);
router.get('/patient/:patientId', medicalRecordController.getPatientMedicalRecords);
router.get('/', medicalRecordController.getAllMedicalRecords);
router.delete('/:id', medicalRecordController.deleteMedicalRecord);
router.put('/:id', upload.single('report'), medicalRecordController.updateMedicalRecord);

module.exports = router;

