const deleteAdmin = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email required' });
  }
  try {
    const Admin = require('../models/Admin');
    const result = await Admin.deleteOne({ email });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.status(200).json({ success: true, message: 'Admin deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
const getAllAdmins = async (req, res) => {
  try {
    const Admin = require('../models/Admin');
    const admins = await Admin.find({}, 'email');
    res.status(200).json({ success: true, admins });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
const Admin = require('../models/Admin');
const createAdmin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }
  try {
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const admin = new Admin({ email, password: hashed });
    await admin.save();
    return res.status(200).json({ success: true, message: 'Admin created successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// For demo: store super admin password in a local file (superadmin.json)
const superAdminFile = path.join(__dirname, '../models/superadmin.json');

const resetSuperAdminPassword = async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password required' });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    fs.writeFileSync(superAdminFile, JSON.stringify({ password: hashed }));
    return res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { resetSuperAdminPassword, createAdmin, getAllAdmins, deleteAdmin };
