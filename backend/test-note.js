const dotenv = require('dotenv');

async function run() {
  dotenv.config({ path: '.env' });
  const token = process.env.AMO_ACCESS_TOKEN;
  const domain = process.env.AMO_DOMAIN;
  
  const payload = {
    note_type: 'common',
    params: {
      text: `[Від партнера Test]:\nTest message 2`
    }
  };

  const leadId = 47341612;

  const response = await fetch(`https://${domain}/api/v4/leads/${leadId}/notes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([payload]),
  });

  const text = await response.text();
  console.log('Status:', response.status);
  console.log('Response:', text);
  process.exit(0);
}
run();
