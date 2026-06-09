import * as dotenv from 'dotenv';
import * as path from 'path';
import fetch from 'node-fetch';
import Redis from 'ioredis';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const AMO_DOMAIN = process.env.AMO_DOMAIN;
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

async function getAccessToken() {
  return process.env.AMO_ACCESS_TOKEN || await redis.get('amo:access_token');
}

async function main() {
  const token = await getAccessToken();
  if (!token) {
    console.error('No AMO token found in Redis');
    process.exit(1);
  }
  console.log('Got token');

  const OLD_PIPELINE_ID = 8600274;
  const NEW_PIPELINE_ID = 8696950;
  const LOST_STATUS = 143; // Closed and not realized
  
  const NEW_STAGES = [74717798, 74717802, 74717806, 74717810, 142];

  // 1. Fetch leads from old pipeline
  let page = 1;
  let hasMore = true;
  const leadsToMove: any[] = [];

  while (hasMore) {
    const url = `https://${AMO_DOMAIN}/api/v4/leads?filter[pipeline_id][]=${OLD_PIPELINE_ID}&limit=250&page=${page}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    
    if (res.status === 204) break;
    if (!res.ok) {
      console.error('Failed to fetch leads:', await res.text());
      break;
    }

    const data: any = await res.json();
    const leads = data?._embedded?.leads || [];
    
    for (const lead of leads) {
      if (lead.name && lead.name.startsWith('Заявка от партнера:')) {
        leadsToMove.push(lead);
      }
    }

    if (!data?._links?.next) {
      hasMore = false;
    } else {
      page++;
    }
  }

  console.log(`Found ${leadsToMove.length} leads to process.`);

  if (leadsToMove.length === 0) {
    console.log('No leads found.');
    process.exit(0);
  }

  // 2. Move old leads to Closed/Not Realized in OLD pipeline
  const updatePayload = leadsToMove.map(l => ({
    id: l.id,
    status_id: LOST_STATUS
  }));

  const updateRes = await fetch(`https://${AMO_DOMAIN}/api/v4/leads`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(updatePayload)
  });

  if (!updateRes.ok) {
    console.error('Failed to update old leads:', await updateRes.text());
  } else {
    console.log(`Moved ${updatePayload.length} leads to Closed/Lost in pipeline ${OLD_PIPELINE_ID}`);
  }

  // 3. Recreate them in NEW pipeline in different stages
  const createPayload = leadsToMove.map((l, index) => {
    const stage = NEW_STAGES[index % NEW_STAGES.length];
    return {
      name: l.name,
      price: l.price,
      pipeline_id: NEW_PIPELINE_ID,
      status_id: stage,
      custom_fields_values: l.custom_fields_values
    };
  });

  const createRes = await fetch(`https://${AMO_DOMAIN}/api/v4/leads`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(createPayload)
  });

  if (!createRes.ok) {
    console.error('Failed to create new leads:', await createRes.text());
  } else {
    console.log(`Created ${createPayload.length} new leads in pipeline ${NEW_PIPELINE_ID} with various stages.`);
  }

  process.exit(0);
}

main().catch(console.error);
