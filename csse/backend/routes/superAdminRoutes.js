
const express = require('express');
const { 
  resetSuperAdminPassword, 
  createAdmin, 
  getAllAdmins, 
  deleteAdmin,
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
  getAllUsers,
  deleteUser
} = require('../controllers/superAdminController');
const router = express.Router();

router.get('/admins', getAllAdmins);
router.post('/reset-password', resetSuperAdminPassword);
router.post('/create-admin', createAdmin);
router.post('/delete-admin', deleteAdmin);
router.get('/pending-doctors', getPendingDoctors);
router.post('/approve-doctor', approveDoctor);
router.post('/reject-doctor', rejectDoctor);
router.get('/all-users', getAllUsers);
router.delete('/delete-user', deleteUser);

module.exports = router;
