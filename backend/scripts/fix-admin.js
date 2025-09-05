const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user.js');
require('dotenv').config();

async function fixAdmin() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);

    // Delete existing admin user if it exists
    await User.deleteOne({
      $or: [
        { username: 'admin' },
        { email: 'admin@caseyuptime.com' }
      ]
    });
    console.log('Deleted existing admin user');

    // Create new admin user - let the pre-save hook handle hashing
    const admin = new User({
        username: 'admin',
        email: 'admin@caseyuptime.com',
        firstName: 'Admin',
        lastName: 'User',
        company: 'Casey Platform',
        role: 'admin',
        userType: 'admin',
        password: 'admin123',  // Plain password - pre-save hook will hash it
        consent: true,
        isActive: true
    });


    await admin.save();
    console.log('Admin user recreated successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@caseyuptime.com');

    process.exit(0);
  } catch (error) {
    console.error('Error fixing admin:', error);
    process.exit(1);
  }
}

fixAdmin();
