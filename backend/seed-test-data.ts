import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching active partner...');
  // Find a partner to attach the test data to. We'll use the first active partner.
  let partner = await prisma.partner.findFirst({
    where: { isActive: true },
    include: { users: true }
  });

  if (!partner) {
    console.log('No active partner found. Creating one...');
    partner = await prisma.partner.create({
      data: {
        id: uuidv4(),
        name: 'Main Test Partner',
        isActive: true,
      },
      include: { users: true }
    });
  }

  console.log(`Using Partner: ${partner.name} (${partner.id})`);

  // 1. Create referred partners (Referrals)
  console.log('Creating referred partners...');
  const referredPartners: any[] = [];
  for (let i = 1; i <= 3; i++) {
    const rp = await prisma.partner.create({
      data: {
        id: uuidv4(),
        name: `Referred Partner ${i}`,
        isActive: true,
        referredById: partner.id,
      }
    });
    referredPartners.push(rp);
  }

  // 2. Create Leads (LeadSnapshots) spread over the last 90 days
  console.log('Creating lead snapshots...');
  const statuses = ['142', '8696950:74717798', '10776450:84853590', '10776450:142'];
  const pipelines = [8696950n, 10776450n];
  const cities = ['Dubai', 'Abu Dhabi', 'Ras Al Khaimah', 'Sharjah'];
  
  for (let i = 1; i <= 20; i++) {
    const pipelineId = pipelines[i % 2];
    const isWon = i % 3 === 0;
    const status = isWon ? (pipelineId === 8696950n ? '142' : '10776450:142') : statuses[i % statuses.length];
    
    // Random date within the last 90 days
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    const externalLeadId = BigInt(Math.floor(Math.random() * 100000000));

    await prisma.leadSnapshot.create({
      data: {
        externalLeadId,
        partnerId: partner.id,
        title: `Test Lead ${i}`,
        status: status,
        budget: Math.floor(Math.random() * 5000000) + 500000,
        city: cities[i % cities.length],
        contactName: `Client ${i}`,
        contactPhone: `+9715012345${i.toString().padStart(2, '0')}`,
        brokerName: 'Test Broker',
        createdAtSource: date,
        updatedAtSource: date,
        syncedAt: new Date(),
        pipelineId: pipelineId,
        tagIds: [BigInt(12345)]
      }
    });

    // Add LeadStatusHistory
    await prisma.leadStatusHistory.create({
      data: {
        externalLeadId,
        partnerId: partner.id,
        toStatus: status,
        changedAt: date,
      }
    });
  }

  // 3. Create Commissions (Payouts and Referrals)
  console.log('Creating commissions...');
  
  // Direct Commissions
  for (let i = 1; i <= 5; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    await prisma.commission.create({
      data: {
        partnerId: partner.id,
        amount: Math.floor(Math.random() * 20000) + 5000,
        currency: 'AED',
        type: 'DIRECT',
        status: i % 2 === 0 ? 'AVAILABLE' : 'PAID',
        description: `Direct Commission for Deal #${i}`,
        createdAt: date,
        updatedAt: date
      }
    });
  }

  // Referral Commissions
  for (let i = 1; i <= 3; i++) {
    const daysAgo = Math.floor(Math.random() * 60);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    await prisma.commission.create({
      data: {
        partnerId: partner.id,
        amount: Math.floor(Math.random() * 5000) + 1000,
        currency: 'AED',
        type: 'REFERRAL',
        status: 'PAID',
        description: `Referral bonus from ${referredPartners[i % referredPartners.length].name}`,
        createdAt: date,
        updatedAt: date
      }
    });
  }

  // 4. Create Payout Requests
  console.log('Creating payout requests...');
  await prisma.payout.create({
    data: {
      partnerId: partner.id,
      amount: 15000,
      currency: 'AED',
      status: 'COMPLETED',
      type: 'BANK_TRANSFER',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      processedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.payout.create({
    data: {
      partnerId: partner.id,
      amount: 5000,
      currency: 'AED',
      status: 'PENDING',
      type: 'USDT',
      createdAt: new Date(),
    }
  });

  console.log('Test data successfully seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
