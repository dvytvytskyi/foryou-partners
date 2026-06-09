import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const pipelineId = BigInt(10776450);
  
  const statuses = await prisma.leadSnapshot.groupBy({
    by: ['status'],
    where: { pipelineId },
    _count: { _all: true }
  });
  
  console.log(`Statuses for pipeline ${pipelineId}:`);
  statuses.forEach(s => {
    console.log(`  ${s.status}: ${s._count._all}`);
  });

  await prisma.$disconnect();
}

main();
