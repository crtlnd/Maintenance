const express = require('express');
const app = express();
app.get('/api/hello', (req, res) => { res.send('Hello from backend!'); });
app.listen(3000, () => console.log('Server running on port 3000'));
