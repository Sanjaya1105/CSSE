const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Staff = require('../models/Staff');
const bcrypt = require('bcryptjs');

// @desc    Login user
// @route   POST /api/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Super Admin login using password from database
    if (email === 'superadmin@gmail.com') {
      const fs = require('fs');
      const path = require('path');
      const superAdminFile = path.join(__dirname, '../models/superadmin.json');
      let superAdminData;
      try {
        superAdminData = JSON.parse(fs.readFileSync(superAdminFile, 'utf8'));
      } catch {
        return res.status(500).json({ success: false, message: 'Super Admin data error' });
      }
      const isPasswordMatch = await bcrypt.compare(password, superAdminData.password);
      if (isPasswordMatch) {
        return res.status(200).json({
          success: true,
          message: 'Login successful',
          data: {
            user: {
              email: 'superadmin@gmail.com',
              name: 'Super Admin'
            },
            userType: 'superadmin'
          }
        });
      } else {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
    }

    // Admin login
    if (email) {
      const Admin = require('../models/Admin');
      const admin = await Admin.findOne({ email });
      if (admin) {
        const isPasswordMatch = await bcrypt.compare(password, admin.password);
        if (isPasswordMatch) {
          return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
              user: { email: admin.email },
              userType: 'admin'
            }
          });
        } else {
          return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
      }
    }
    // Search in all three collections
    let user = null;
    let userType = null;

    // Check Patient collection
    user = await Patient.findOne({ email });
    if (user) {
      userType = 'patient';
    }

    // Check Doctor collection
    if (!user) {
      user = await Doctor.findOne({ email });
      if (user) {
        // Check if doctor account is approved
        if (user.status === 'pending') {
          return res.status(403).json({
            success: false,
            message: 'Your account is pending approval by the Super Admin'
          });
        }
        if (user.status === 'rejected') {
          return res.status(403).json({
            success: false,
            message: 'Your account has been rejected'
          });
        }
        userType = 'doctor';
      }
    }

    // Check Staff collection
    if (!user) {
      user = await Staff.findOne({ email });
      if (user) {
        userType = 'staff';
      }
    }

    // If user not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        userType: userType
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

module.exports = { loginUser };

