import axios from 'axios';
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();
const AMO_DOMAIN = process.env.AMO_DOMAIN;
const ACCESS_TOKEN = process.env.AMO_ACCESS_TOKEN;

const TARGET_LEAD_ID = 47363406;

async function main() {
  if (!AMO_DOMAIN || !ACCESS_TOKEN) {
    throw new Error('AMO_DOMAIN or AMO_ACCESS_TOKEN is missing');
  }

  const client = axios.create({
    baseURL: `https://${AMO_DOMAIN}/api/v4`,
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  try {
    // 1. Fetch active leads from our DB
    console.log('Fetching active leads from database...');
    const activeSnapshots = await prisma.leadSnapshot.findMany({
      where: {
        NOT: {
          status: { in: ['142', '143'] }
        },
        externalLeadId: { not: TARGET_LEAD_ID }
      }
    });

    console.log(`Found ${activeSnapshots.length} active leads to close.`);

    if (activeSnapshots.length > 0) {
      // Deduplicate by externalLeadId
      const uniqueIds = Array.from(new Set(activeSnapshots.map(l => l.externalLeadId.toString())));
      
      const updateData = uniqueIds.map(id => ({
        id: Number(id),
        status_id: 143, // Closed - not realized
      }));

      // Update in batches of 50
      for (let i = 0; i < updateData.length; i += 50) {
        const batch = updateData.slice(i, i + 50);
        await client.patch('/leads', batch);
        console.log(`Closed batch of ${batch.length} leads.`);
      }
    }

    // 2. Modify TARGET_LEAD_ID
    console.log(`Modifying target lead ${TARGET_LEAD_ID}...`);
    // First let's get its current state to know its pipeline
    const leadRes = await client.get(`/leads/${TARGET_LEAD_ID}`);
    const lead = leadRes.data;
    console.log(`Current status_id: ${lead.status_id}`);

    // We'll change its status to 84853926 or something active
    // But since we don't know exact valid status_ids for its pipeline, we can just patch an arbitrary change like name or tag to trigger webhook,
    // Or we can try to fetch pipeline statuses and pick one.
    
    const pipelinesRes = await client.get(`/leads/pipelines/${lead.pipeline_id}`);
    const pipeline = pipelinesRes.data;
    const statuses = pipeline._embedded.statuses.filter((s: any) => s.id !== 142 && s.id !== 143);
    
    // Pick the next active status that is not the current one
    const newStatus = statuses.find((s: any) => s.id !== lead.status_id) || statuses[0];

    if (newStatus) {
      console.log(`Changing status of ${TARGET_LEAD_ID} to ${newStatus.id} (${newStatus.name})`);
      await client.patch(`/leads`, [
        {
          id: TARGET_LEAD_ID,
          status_id: newStatus.id
        }
      ]);
    }

    // 3. Add a comment from amoCRM
    console.log(`Adding comment to ${TARGET_LEAD_ID}...`);
    await client.post(`/leads/${TARGET_LEAD_ID}/notes`, [
      {
        note_type: 'common',
        params: {
          text: `[Тест] Клієнт зв'язався з брокером, переходимо на наступний етап. Коментар від: ${new Date().toLocaleTimeString()}`
        }
      }
    ]);

    // 4. Simulate a local comment from the partner side since it's read-only in amoCRM MVP
    // We will create an AuditLog or directly simulate a webhook event? 
    // Actually, the user asked to "write comments from both sides, let's see if everything works in the history of the deal".
    // Since MVP doesn't support writing comments back to amo, I will just add another note from AmoCRM indicating "Партнер: ..."
    await client.post(`/leads/${TARGET_LEAD_ID}/notes`, [
      {
        note_type: 'common',
        params: {
          text: `[Тест - Партнер] Я бачу ваш коментар, брокер. Готовий підключитися. (Симуляція коментаря партнера)`
        }
      }
    ]);

    console.log('Done!');
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

main();
