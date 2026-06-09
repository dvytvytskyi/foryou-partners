const dotenv = require('dotenv');

async function run() {
  dotenv.config({ path: '.env' });
  const token = process.env.AMO_ACCESS_TOKEN;
  const domain = process.env.AMO_DOMAIN;
  
  const leadId = 47341612;

  const response = await fetch(`https://${domain}/api/v4/events?filter[entity]=lead&filter[entity_id]=${leadId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Events types:', data._embedded?.events?.map(e => e.type));
  console.log('First event:', JSON.stringify(data._embedded?.events?.[0], null, 2));
  process.exit(0);
}
run();
