// backend/migrate-assets.js
const mongoose = require('mongoose');
const User = require('./src/models/user');
const Asset = require('./src/models/asset');
require('dotenv').config();

async function migrateAssets() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/maintenance');
    console.log('Connected to MongoDB');
    const result = await Asset.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: 1 } } // Replace 1 with an existing user ID
    );
    console.log(`Assigned ${result.modifiedCount} assets to default user (userId: 1)`);
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateAssets();
