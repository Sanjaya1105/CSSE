const express = require('express');
const { resetSuperAdminPassword } = require('../controllers/superAdminController');
const router = express.Router();

router.post('/reset-password', resetSuperAdminPassword);

module.exports = router;
