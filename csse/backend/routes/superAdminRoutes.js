
const express = require('express');
const { resetSuperAdminPassword, createAdmin, getAllAdmins, deleteAdmin } = require('../controllers/superAdminController');
const router = express.Router();

router.get('/admins', getAllAdmins);
router.post('/reset-password', resetSuperAdminPassword);
router.post('/create-admin', createAdmin);
router.post('/delete-admin', deleteAdmin);

module.exports = router;
