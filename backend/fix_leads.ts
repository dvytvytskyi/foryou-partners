import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.leadSnapshot.updateMany({
    where: {
      OR: [
        { status: '143' },
        { pipelineId: null }
      ]
    },
    data: {
      status: '8696950:70457446',
      pipelineId: BigInt(8696950)
    }
  });
  console.log(`Updated ${updated.count} leads.`);
  
  // also delete old leads created by testing
}

main().catch(console.error).finally(() => prisma.$disconnect());
