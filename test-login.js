const axios = require('axios');
axios.post('https://partners.foryou-admin.ru/api/v1/auth/login', {
  email: 'partner15@foryou-realestate.com',
  password: 'PartnerPassword123!'
}, {
  headers: {
    'Origin': 'https://partners.foryou-admin.ru',
    'Content-Type': 'application/json'
  }
}).then(res => console.log('OK', res.status)).catch(err => console.log('ERROR', err.response?.status, err.response?.data));
