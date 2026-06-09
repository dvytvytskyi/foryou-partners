import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const count = await prisma.leadSnapshot.count();
  const withPhone = await prisma.leadSnapshot.count({
    where: {
      contactPhone: { not: null, not: '' }
    }
  });
  console.log(`Total leads: ${count}`);
  console.log(`Leads with phone: ${withPhone}`);
  await prisma.$disconnect();
}

main();
