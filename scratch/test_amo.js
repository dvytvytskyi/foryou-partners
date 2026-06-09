
const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');
const { ConfigService } = require('@nestjs/config');

// Mock ConfigService
const configService = {
  get: (key) => {
    const env = {
      AMO_DOMAIN: 'dev.amocrm.ru',
      AMO_CLIENT_ID: 'dev_client_id',
      AMO_CLIENT_SECRET: 'dev_client_secret',
      AMO_REDIRECT_URI: 'https://localhost/callback',
      AMO_REFRESH_TOKEN: 'dev_refresh_token',
      AMO_API_DOMAIN: 'reforyou.amocrm.ru'
    };
    return env[key];
  }
};

async function testFetchPipelines() {
  const redis = new Redis();
  
  const apiDomain = configService.get('AMO_API_DOMAIN') || 'reforyou.amocrm.ru';
  console.log(`Using domain: ${apiDomain}`);

  // This is a simplified version of fetchAmoPipelines
  const url = `https://${apiDomain}/api/v4/leads/pipelines`;
  console.log(`Fetching from ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer dummy` },
    });
    console.log(`Response status: ${response.status}`);
    const text = await response.text();
    console.log(`Response body: ${text.slice(0, 100)}...`);
  } catch (e) {
    console.error('Fetch failed:', e);
  } finally {
    redis.disconnect();
  }
}

testFetchPipelines();
