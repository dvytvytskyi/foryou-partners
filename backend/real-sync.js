const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Redis = require('ioredis');
const fs = require('fs');
const dotenv = require('dotenv');

async function run() {
  const env = dotenv.parse(fs.readFileSync('.env'));
  const domain = env.AMO_DOMAIN;
  
  const redis = new Redis({
    host: env.REDIS_HOST || 'localhost',
    port: parseInt(env.REDIS_PORT || '6380'),
    password: env.REDIS_PASSWORD || 'dev_redis_password'
  });

  const token = await redis.get('amo:access_token');
  
  if (!token) {
    console.log("No token in redis");
    return;
  }

  // Fetch users map
  const usersRes = await fetch(`https://${domain}/api/v4/users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const usersData = await usersRes.json();
  const users = usersData._embedded?.users || [];
  
  const usersMap = {};
  for (const u of users) {
    usersMap[u.id] = u;
  }

  // Fetch the latest leads from DB
  const leads = await prisma.leadSnapshot.findMany({ take: 5, orderBy: { id: 'desc' } });
  
  for (const lead of leads) {
    if (lead.externalLeadId > 0) {
      console.log("Syncing lead", lead.externalLeadId);
      const leadRes = await fetch(`https://${domain}/api/v4/leads/${lead.externalLeadId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (leadRes.ok) {
        const amoLead = await leadRes.json();
        const responsibleId = amoLead.responsible_user_id;
        const broker = usersMap[responsibleId];
        
        if (broker) {
          console.log(`Found real broker: ${broker.name} - ${broker.email || 'No email'}`);
          await prisma.leadSnapshot.update({
            where: { id: lead.id },
            data: {
              brokerName: broker.name,
              brokerEmail: broker.email || null,
              brokerPhone: null, 
            }
          });
        } else {
          console.log(`No broker found for ID ${responsibleId}`);
        }
      } else {
        console.log(`Failed to fetch lead ${lead.externalLeadId} from amoCRM`);
      }
    }
  }
  
  await redis.quit();
}

run().then(() => console.log("Done")).catch(console.error).finally(() => { prisma.$disconnect(); });
