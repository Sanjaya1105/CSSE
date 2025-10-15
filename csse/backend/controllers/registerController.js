const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Staff = require('../models/Staff');
const bcrypt = require('bcryptjs');

// @desc    Register a new user (Patient/Doctor/Staff)
// @route   POST /api/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { userType, email, password, ...otherData } = req.body;

    // Validate user type
    if (!['patient', 'doctor', 'staff'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type'
      });
    }

    // Check if email already exists in any collection
    const existingPatient = await Patient.findOne({ email });
    const existingDoctor = await Doctor.findOne({ email });
    const existingStaff = await Staff.findOne({ email });

    if (existingPatient || existingDoctor || existingStaff) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser;

    // Create user based on type
    switch (userType) {
      case 'patient':
        newUser = await Patient.create({
          ...otherData,
          email,
          password: hashedPassword,
          userType: 'patient'
        });
        break;

      case 'doctor':
        newUser = await Doctor.create({
          ...otherData,
          email,
          password: hashedPassword,
          userType: 'doctor',
          channelingFee: null  // default null when registering
        });
        break;

      case 'staff':
        newUser = await Staff.create({
          ...otherData,
          email,
          password: hashedPassword,
          userType: 'staff'
        });
        break;
    }

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

module.exports = { registerUser };

