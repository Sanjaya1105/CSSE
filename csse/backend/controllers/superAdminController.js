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

module.exports = { resetSuperAdminPassword };
