const dotenv = require('dotenv');

async function run() {
  dotenv.config({ path: '.env' });
  const token = process.env.AMO_ACCESS_TOKEN;
  const domain = process.env.AMO_DOMAIN;
  
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const payload = [
    {
      name: "Направление",
      type: "select",
      enums: [
        { value: "Дубай", sort: 10 },
        { value: "Абу-Даби", sort: 20 },
        { value: "РАК", sort: 30 },
        { value: "Оман", sort: 40 }
      ]
    },
    {
      name: "Как связаться",
      type: "select",
      enums: [
        { value: "Напрямую", sort: 10 },
        { value: "Только через меня", sort: 20 }
      ]
    },
    {
      name: "Название партнера",
      type: "text"
    }
  ];

  console.log("Creating fields...");
  const response = await fetch(`https://${domain}/api/v4/leads/custom_fields`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  console.log("Response status:", response.status);
  console.log("Response data:", JSON.stringify(data, null, 2));

  // If successful, extract IDs
  if (data._embedded && data._embedded.custom_fields) {
    for (const field of data._embedded.custom_fields) {
      console.log(`\nField created: ${field.name}`);
      console.log(`ID: ${field.id}`);
      if (field.enums) {
        console.log("Enums:");
        field.enums.forEach(e => {
          console.log(`  ${e.value} (ID: ${e.id})`);
        });
      }
    }
  }
}
run();
