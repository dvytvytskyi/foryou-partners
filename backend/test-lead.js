const dotenv = require('dotenv');

async function run() {
  dotenv.config({ path: '.env' });
  const token = process.env.AMO_ACCESS_TOKEN;
  const domain = process.env.AMO_DOMAIN;
  
  const leadId = 32800615;

  const response = await fetch(`https://${domain}/api/v4/leads/${leadId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const text = await response.text();
  console.log('Status:', response.status);
  console.log('Response:', text.slice(0, 200));
  process.exit(0);
}
run();
