
import fetch from 'node-fetch';

async function test() {
  const domain = 'reforyou.amocrm.ru';
  const accessToken = 'PASTE_TOKEN_HERE'; // I need to get it from the DB
  const fieldId = 703131;
  const enumId = 695175; // Artem leads

  const urls = [
    `https://${domain}/api/v4/leads?filter[custom_fields_values][${fieldId}][]=${enumId}&limit=10`,
    `https://${domain}/api/v4/leads?filter[custom_fields_values][${fieldId}]=${enumId}&limit=10`,
  ];

  for (const url of urls) {
    console.log(`Testing URL: ${url}`);
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log(`Status: ${res.status} ${res.statusText}`);
    if (res.ok) {
      const data = await res.json();
      console.log(`Found: ${data?._embedded?.leads?.length || 0} leads`);
    } else {
      const text = await res.text();
      console.log(`Error body: ${text}`);
    }
  }
}
