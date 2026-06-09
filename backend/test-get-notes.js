const dotenv = require('dotenv');

async function run() {
  dotenv.config({ path: '.env' });
  const token = process.env.AMO_ACCESS_TOKEN;
  const domain = process.env.AMO_DOMAIN;
  
  const leadId = 47341612;

  const response = await fetch(`https://${domain}/api/v4/leads/${leadId}/notes`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const text = await response.json();
  console.log('Status:', response.status);
  console.log('Notes:', JSON.stringify(text, null, 2));
  process.exit(0);
}
run();
