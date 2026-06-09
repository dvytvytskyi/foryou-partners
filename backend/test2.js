const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { startOfDay, endOfDay } = require('date-fns');

async function main() {
  const start = new Date('2026-04-13T00:00:00Z');
  const end = new Date('2026-04-13T23:59:59Z');
  
  const count = await prisma.leadSnapshot.count({
    where: { updatedAtSource: { gte: start, lte: end } }
  });
  console.log('Count on April 13 (UTC):', count);
  
  const sample = await prisma.leadSnapshot.findFirst({
    where: { updatedAtSource: { gte: start, lte: end } }
  });
  console.log('Sample updated at:', sample.updatedAtSource);
  console.log('Sample synced at:', sample.syncedAt);
  console.log('Sample pipeline:', sample.pipelineId);
  console.log('Sample partner:', sample.partnerId);
  console.log('Sample custom fields (created_at?):', sample.customFields?.created_at);
}
main().catch(console.error).finally(() => prisma.$disconnect());
