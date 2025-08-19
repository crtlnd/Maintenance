const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
const { expressjwt } = require('express-jwt');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const uri = 'mongodb://localhost:27017'; // Update with your MongoDB URI if different
const client = new MongoClient(uri);

app.use(bodyParser.json());

app.use((req, res, next) => {
  if (req.path === '/api/auth/login' && req.method === 'POST') return next();
  if (req.path === '/api/hello' && req.method === 'GET') return next();
  expressjwt({
    secret: 'your-secret-key',
    algorithms: ['HS256'],
    getToken: req => req.headers.authorization?.split(' ')[1]
  })(req, res, next);
});

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({ error: 'Invalid or missing token' });
  } else {
    next();
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') { // Replace with secure validation
    const token = jwt.sign({ username }, 'your-secret-key', { expiresIn: '1h' });
    res.send({ token });
  } else {
    res.status(401).send({ error: 'Invalid credentials' });
  }
});

async function run() {
  try {
    await client.connect();
    const database = client.db('maintenance');
    const assets = database.collection('assets');
    app.get('/api/assets', async (req, res) => {
      const { location } = req.query;
      const query = location ? { location } : {};
      const result = await assets.find(query).toArray();
      res.send(result);
    });
    app.post('/api/assets', async (req, res) => {
      const { name, location } = req.body;
      if (!name || !location) {
        return res.status(400).send({ error: 'Name and location are required' });
      }
      const newAsset = { id: (await assets.countDocuments()) + 1, name, location };
      await assets.insertOne(newAsset);
      res.send(newAsset);
    });
  } finally {
    // Keep the connection open for this example
    // await client.close(); // Uncomment to close on app exit if needed
  }
}

run().catch(console.dir);

app.get('/api/hello', (req, res) => { res.send('Hello from backend!'); });

app.listen(3000, () => console.log('Server running on port 3000'));
