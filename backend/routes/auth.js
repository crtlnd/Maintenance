const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

module.exports = () => {
  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });
    if (username === 'admin' && password === 'password') {
      const token = jwt.sign({ username }, 'your-secret-key', { expiresIn: '24h' });
      console.log('Generated Token:', token);
      res.send({ token });
    } else {
      res.status(401).send({ error: 'Invalid credentials' });
    }
  });

  return router;
};
