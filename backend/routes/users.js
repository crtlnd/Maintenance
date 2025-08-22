const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const router = express.Router();

module.exports = () => {
  router.get('/profile', async (req, res) => {
    try {
      const user = await User.findOne({ id: req.auth.userId }).populate('assets');
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
      res.send(user);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).send({ error: 'Server error' });
    }
  });

  router.put(
    '/profile',
    [
      body('notificationPreferences.email').optional().isBoolean().withMessage('Email preference must be a boolean'),
      body('notificationPreferences.sms').optional().isBoolean().withMessage('SMS preference must be a boolean')
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).send({ errors: errors.array() });
        }
        const { notificationPreferences } = req.body;
        const user = await User.findOneAndUpdate(
          { id: req.auth.userId },
          { $set: { notificationPreferences } },
          { new: true }
        );
        if (!user) {
          return res.status(404).send({ error: 'User not found' });
        }
        res.send(user);
      } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  return router;
};
