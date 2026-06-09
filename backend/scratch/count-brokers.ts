import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const count = await prisma.leadSnapshot.count();
  const withBroker = await prisma.leadSnapshot.count({
    where: {
      brokerName: { not: null, not: '' }
    }
  });
  console.log(`Total leads: ${count}`);
  console.log(`Leads with broker: ${withBroker}`);
  await prisma.$disconnect();
}

main();
