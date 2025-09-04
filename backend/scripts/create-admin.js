const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');
require('dotenv').config();

async function createAdmin() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      $or: [
        { username: 'admin' },
        { email: 'admin@casey.com' }
      ]
    });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Username:', existingAdmin.username);
      console.log('Email:', existingAdmin.email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = new User({
      username: 'admin',
      email: 'admin@casey.com',
      firstName: 'Admin',
      lastName: 'User',
      company: 'Casey Platform',
      role: 'admin',
      userType: 'admin',
      password: hashedPassword,
      consent: true,
      isActive: true
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@casey.com');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
