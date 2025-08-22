const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

module.exports = () => {
  router.post(
    '/login',
    [
      body('username').trim().notEmpty().withMessage('Username is required'),
      body('password').notEmpty().withMessage('Password is required')
    ],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
      }
      const { username, password } = req.body;
      console.log('Login attempt:', { username, password });
      if (username === 'admin' && password === 'password') {
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '24h' });
        console.log('Generated Token:', token);
        res.send({ token });
      } else {
        res.status(401).send({ error: 'Invalid credentials' });
      }
    }
  );

  return router;
};
