const axios = require('axios');

async function run() {
  try {
    // First login
    const loginRes = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'alex.klykov@foryou-realestate.com',
      password: 'password'
    });
    const token = loginRes.data.accessToken;

    console.log("Logged in!");

    // Now try to post note
    const res = await axios.post('http://localhost:3001/api/v1/leads/47602938/notes', {
      text: "Test script message"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(res.data);
  } catch(e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
run();
