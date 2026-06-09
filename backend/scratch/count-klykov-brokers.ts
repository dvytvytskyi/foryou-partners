import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const klykovLeads = await prisma.leadSnapshot.count({
    where: {
      status: { startsWith: '10776450:' }
    }
  });
  const klykovWithBroker = await prisma.leadSnapshot.count({
    where: {
      status: { startsWith: '10776450:' },
      brokerName: { not: null, not: '' }
    }
  });
  console.log(`Klykov leads: ${klykovLeads}`);
  console.log(`Klykov with broker: ${klykovWithBroker}`);
  await prisma.$disconnect();
}

main();
