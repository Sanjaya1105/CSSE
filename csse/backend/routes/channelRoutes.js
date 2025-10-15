const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const channelController = require('../controllers/channelController');

// Set up multer for report uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/reports'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });


router.post('/save', upload.single('report'), channelController.saveChannelDetails);
router.get('/history', channelController.getChannelHistory);

module.exports = router;
