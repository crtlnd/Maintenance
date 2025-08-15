const { MongoClient } = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const uri = 'mongodb://localhost:27017'; // Update with your MongoDB URI if different
const client = new MongoClient(uri);

app.use(bodyParser.json());

async function run() {
  try {
    await client.connect();
    const database = client.db('maintenance');
    const assets = database.collection('assets');

    app.get('/api/assets', async (req, res) => {
      const result = await assets.find().toArray();
      res.send(result);
    });

    app.post('/api/assets', async (req, res) => {
      const newAsset = { id: (await assets.countDocuments()) + 1, ...req.body };
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
