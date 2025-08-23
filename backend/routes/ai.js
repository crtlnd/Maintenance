const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const axios = require('axios');
const router = express.Router();

module.exports = () => {
  router.post(
    '/query',
    [
      body('query').trim().notEmpty().withMessage('Query is required')
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).send({ errors: errors.array() });
        }
        const { query } = req.body;
        const user = await User.findOne({ id: req.auth.userId });
        if (!user) {
          return res.status(404).send({ error: 'User not found' });
        }
        if (user.subscriptionTier !== 'ai-powered') {
          return res.status(403).send({ error: 'AI-Powered plan required' });
        }
        console.log('Sending request to Grok API:', { query, apiKey: process.env.XAI_API_KEY.substring(0, 4) + '...' });
        const response = await axios.post(
          'https://api.x.ai/v1/chat/completions',
          {
            model: 'grok-4',
            messages: [{ role: 'user', content: query }],
            max_tokens: 500
          },
          { headers: { Authorization: `Bearer ${process.env.XAI_API_KEY}` } }
        );
        console.log('Grok API response:', response.data);
        res.send({ response: response.data.choices[0].message.content });
      } catch (error) {
        console.error('Error querying Grok:', {
          message: error.message,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data
          } : null
        });
        res.status(500).send({ error: 'Server error' });
      }
    }
  );

  return router;
};
