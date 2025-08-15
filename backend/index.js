const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
let assets = [{ id: 1, name: 'Truck #001', location: 'Houston Depot' }];
app.get('/api/hello', (req, res) => { res.send('Hello from backend!'); });
app.get('/api/assets', (req, res) => { res.send(assets); });
app.post('/api/assets', (req, res) => {
  const newAsset = { id: assets.length + 1, ...req.body };
  assets.push(newAsset);
  res.send(newAsset);
});
app.listen(3000, () => console.log('Server running on port 3000'));
