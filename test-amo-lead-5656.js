const dotenv = require('dotenv');

async function run() {
  dotenv.config({ path: 'backend/.env' });
  const token = process.env.AMO_ACCESS_TOKEN;
  const domain = process.env.AMO_DOMAIN;
  
  const leadId = 47345656;

  const response = await fetch(`https://${domain}/api/v4/leads/${leadId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();
  console.log(`Pipeline: ${data.pipeline_id}, Status: ${data.status_id}, Name: ${data.name}`);
}
run();
