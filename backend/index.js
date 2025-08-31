const express = require('express');
const jwt = require('jsonwebtoken');
const { expressjwt } = require('express-jwt');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Debug log to verify environment variables
console.log('Environment variables in index.js:', {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  XAI_API_KEY: process.env.XAI_API_KEY,
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,

});

const app = express();

// Enable CORS
app.use(cors({ origin: 'http://localhost:5173' }));

// Body parser with extended error handling
app.use(bodyParser.json({ limit: '10mb' }));
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Body parsing error:', err.message);
    return res.status(400).send({ error: 'Invalid JSON body' });
  }
  next();
});

app.use((req, res, next) => {
  console.log('Body parsed globally:', req.body);
  next();
});

const exemptRoutes = [
  { path: '/api/auth/login', method: 'POST' },
  { path: '/api/auth/signup', method: 'POST' },
  { path: '/health', method: 'GET' },
  { path: '/api/hello', method: 'GET' },
  { path: '/api/providers', method: 'GET' },
  { path: '/api/providers/subscribe', method: 'POST' },
  { path: '/api/providers/claim', method: 'POST' },
];

function isExemptRoute(req) {
  return exemptRoutes.some(route => route.path === req.path && route.method === req.method);
}

app.use((req, res, next) => {
  if (isExemptRoute(req)) {
    console.log('Exempting Path from JWT:', req.path);
    return next();
  }
  console.log('JWT Authentication - Request Path:', req.path);
  console.log('JWT Authentication - Authorization Header:', req.headers.authorization);
  expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'],
    getToken: req => {
      const token = req.headers.authorization?.split(' ')[1];
      console.log('JWT Authentication - Extracted Token:', token);
      return token;
    },
  })(req, res, (err) => {
    if (err) {
      console.error('JWT Authentication Error:', {
        message: err.message,
        name: err.name,
        code: err.code,
        status: err.status,
      });
      return next(err);
    }
    next();
  });
});

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({ error: 'Invalid or missing token' });
  } else {
    next();
  }
});

// Test route to verify body parsing
app.post('/api/test-body', (req, res) => {
  console.log('Test body received:', req.body);
  res.status(200).send({ received: req.body });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).send({ status: 'healthy' });
});

// Routes
async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/maintenance');
    console.log('Connected to MongoDB successfully');
    console.log('Registering routes...');
    // Clear module cache for providers.js
    delete require.cache[require.resolve('./routes/providers')];
    app.use('/api/assets', require('./routes/assets')());
    app.use('/api/auth', require('./routes/auth')());
    app.use('/api/rca', require('./routes/rca')());
    app.use('/api/rcm', require('./routes/rcm')());
    app.use('/api/providers', require('./routes/providers')());
    app.use('/api/users', require('./routes/users')());
    app.use('/api/admin', require('./routes/admin')());
    app.use('/api/ai', require('./routes/ai')());
    return true;
  } catch (error) {
    console.error('Server setup error:', error);
    process.exit(1);
  }
}

(async () => {
  if (await run()) {
    console.log('Server setup complete, starting server on port 3000');
    app.listen(3000, () => console.log('Server running on port 3000'));
  } else {
    console.error('Server setup failed, not starting');
  }
})();
