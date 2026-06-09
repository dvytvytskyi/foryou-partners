import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const pipelineId = BigInt(10776450);
  
  const count = await prisma.leadSnapshot.count({
    where: { pipelineId }
  });
  
  console.log(`Local count for pipeline ${pipelineId}: ${count}`);
  
  const partnerPipeline = await prisma.partnerPipeline.findFirst({
    where: { amocrmPipelineId: pipelineId },
    include: { partner: true }
  });
  
  if (partnerPipeline) {
    console.log(`Pipeline ${pipelineId} is bound to partner: ${partnerPipeline.partner.name} (${partnerPipeline.partnerId})`);
  } else {
    console.log(`Pipeline ${pipelineId} is NOT bound to any partner.`);
  }

  await prisma.$disconnect();
}

main();
