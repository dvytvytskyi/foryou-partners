const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { startOfDay, endOfDay } = require('date-fns');

async function main() {
  const start = new Date('2026-04-13T00:00:00Z');
  const end = new Date('2026-04-13T23:59:59Z');
  
  const sample = await prisma.leadSnapshot.findFirst({
    where: { updatedAtSource: { gte: start, lte: end } }
  });
  console.log('Sample custom fields:', JSON.stringify(sample.customFields, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
