import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AmoService } from './src/amo/amo.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const amo = app.get(AmoService);
  
  const token = await amo.getAmoAccessTokenPublic();
  const domain = process.env.AMO_DOMAIN;
  
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const payload = [
    {
      name: "Одобрить партнера",
      type: "checkbox"
    }
  ];

  console.log("Creating field...");
  const response = await fetch(`https://${domain}/api/v4/leads/custom_fields`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  console.log("Response data:", JSON.stringify(data, null, 2));

  await app.close();
}
run();
