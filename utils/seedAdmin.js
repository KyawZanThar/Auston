const User = require('../models/User');
const bcrypt = require('bcryptjs');

module.exports = async function seedAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@auston.edu.mm';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminAustonId = process.env.ADMIN_AUSTON_ID || 'AUADMIN';

    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      console.log('Admin user already exists:', existing.email);
      return;
    }

    const hashed = await bcrypt.hash(adminPassword, 10);
    const admin = new User({
      username: 'Administrator',
      email: adminEmail,
      password: hashed,
      austonId: adminAustonId,
      role: 'admin'
    });
    await admin.save();
    console.log('Admin user created:', adminEmail);
  } catch (err) {
    console.error('Admin seeding failed:', err.message || err);
  }
};
