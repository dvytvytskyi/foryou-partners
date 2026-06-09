import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const klykovLeads = await prisma.leadSnapshot.count({
    where: {
      status: { startsWith: '10776450:' }
    }
  });
  const klykovWithPhone = await prisma.leadSnapshot.count({
    where: {
      status: { startsWith: '10776450:' },
      contactPhone: { not: null, not: '' }
    }
  });
  console.log(`Klykov leads: ${klykovLeads}`);
  console.log(`Klykov with phone: ${klykovWithPhone}`);
  await prisma.$disconnect();
}

main();
