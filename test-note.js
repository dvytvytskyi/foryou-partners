const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dotenv = require('dotenv');

async function run() {
  dotenv.config({ path: 'backend/.env' });
  const Redis = require('ioredis');
  const redis = new Redis();
  
  const token = await redis.get('amo:access_token');
  console.log('Token exists:', !!token);
  
  const domain = process.env.AMO_DOMAIN;
  
  const payload = {
    note_type: 'common',
    params: {
      text: `[Від партнера Test]:\nTest message`
    }
  };

  // Replace with a valid lead id
  const leadId = 32800615; // I need a valid lead ID to test

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
}
run();
