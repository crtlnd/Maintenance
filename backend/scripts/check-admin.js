const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');
require('dotenv').config();

async function checkAdmin() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);

    const admin = await User.findOne({ email: 'admin@caseyuptime.com' });

    if (!admin) {
      console.log('Admin user not found');
      return;
    }

    console.log('Admin user found:');
    console.log('Email:', admin.email);
    console.log('Username:', admin.username);
    console.log('Password hash:', admin.password);
    console.log('Password hash length:', admin.password.length);
    console.log('UserType:', admin.userType);
    console.log('Role:', admin.role);

    // Test password comparison
    console.log('\nTesting password comparison:');
    const result1 = await bcrypt.compare('admin123', admin.password);
    console.log('bcrypt.compare("admin123", hash):', result1);

    // Test if password is actually hashed
    console.log('\nChecking if password looks like bcrypt hash:');
    console.log('Starts with $2b$:', admin.password.startsWith('$2b$'));

    process.exit(0);
  } catch (error) {
    console.error('Error checking admin:', error);
    process.exit(1);
  }
}

checkAdmin();

