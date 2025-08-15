const express = require('express');
const app = express();
app.get('/api/hello', (req, res) => { res.send('Hello from backend!'); });
app.get('/api/assets', (req, res) => { res.send([{ id: 1, name: 'Truck #001', location: 'Houston Depot' }]); });
app.listen(3000, () => console.log('Server running on port 3000'));
