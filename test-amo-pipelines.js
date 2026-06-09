const dotenv = require('dotenv');

async function run() {
  dotenv.config({ path: 'backend/.env' });
  const token = process.env.AMO_ACCESS_TOKEN;
  const domain = process.env.AMO_DOMAIN;
  
  const response = await fetch(`https://${domain}/api/v4/leads/pipelines`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();
  const pipeline = data._embedded.pipelines.find(p => p.id === 8600274);
  console.log("Pipeline:", pipeline?.name);
  if (pipeline) {
    const status = pipeline._embedded.statuses.find(s => s.name.toLowerCase().includes('заявка'));
    console.log("Status:", status?.name, "ID:", status?.id);
  }
}
run();
