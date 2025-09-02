const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/maintenance');

async function migrateUsers() {
  try {
    console.log('Starting user migration...');

    const User = require('../models/User');

    const usersToUpdate = await User.find({
      $or: [
        { subscription: { $exists: false } },
        { 'subscription.plan': { $exists: false } }
      ]
    });

    console.log(`Found ${usersToUpdate.length} users to update`);

    for (const user of usersToUpdate) {
      console.log(`Updating user: ${user.email}`);

      const subscriptionPlan = user.subscriptionTier || 'Basic';

      await User.findByIdAndUpdate(user._id, {
        $set: {
          subscription: {
            plan: subscriptionPlan,
            status: 'active',
            startDate: user.createdAt || new Date()
          },
          subscriptionTier: subscriptionPlan,
          userType: user.userType || 'customer'
        }
      });

      console.log(`✓ Updated user: ${user.email}`);
    }

    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

migrateUsers();
