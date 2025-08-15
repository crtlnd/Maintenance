const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.get('/api/hello', (req, res) => { res.send('Hello from backend!'); });
app.get('/api/assets', (req, res) => { res.send([{ id: 1, name: 'Truck #001', location: 'Houston Depot' }]); });
app.post('/api/assets', (req, res) => {
  res.send('Asset added!');
});
app.listen(3000, () => console.log('Server running on port 3000'));
