import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const partnerId = 'dcf2713e-22a9-464a-8bad-5a0c8c182562';
  
  const pipelines = await prisma.partnerPipeline.findMany({
    where: { partnerId }
  });
  
  console.log(`Pipelines for partner Klikov:`);
  pipelines.forEach(p => {
    console.log(`  ${p.amocrmPipelineId}`);
  });

  await prisma.$disconnect();
}

main();
