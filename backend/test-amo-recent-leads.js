const dotenv = require('dotenv');

async function run() {
  dotenv.config({ path: '.env' });
  const token = process.env.AMO_ACCESS_TOKEN;
  const domain = process.env.AMO_DOMAIN;
  
  const response = await fetch(`https://${domain}/api/v4/leads?limit=5&order[created_at]=desc`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();
  
  if (data._embedded && data._embedded.leads) {
    data._embedded.leads.forEach(l => {
      console.log(`ID: ${l.id}, Name: ${l.name}, Pipeline: ${l.pipeline_id}, Status: ${l.status_id}`);
    });
  } else {
    console.log("No leads found or error");
  }
}
run();
