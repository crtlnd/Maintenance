const axios = require('axios');

axios.get('http://localhost:3000/api/providers', {
  params: { lat: '31.9973', lng: '-102.0779', radius: '31', serviceType: 'mechanics' }
})
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
