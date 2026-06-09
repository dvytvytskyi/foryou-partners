import { PrismaClient } from '@prisma/client';

async function bootstrap() {
  const prisma = new PrismaClient();
  const klikovId = 'dcf2713e-22a9-464a-8bad-5a0c8c182562';
  
  console.log('Starting cleanup of Klikov leads...');
  
  // Fetch all Klikov leads
  const leads = await prisma.leadSnapshot.findMany({
    where: { partnerId: klikovId },
    select: { id: true, pipelineId: true, amocrmSource: true }
  });
  
  const allowedPipelines = ['10776450', '8550470'];
  const allowedSource = 'Klykov leads';
  
  const toUnassign = leads.filter(l => {
    const pId = l.pipelineId ? l.pipelineId.toString() : '';
    const src = l.amocrmSource || '';
    return !allowedPipelines.includes(pId) && src !== allowedSource;
  }).map(l => l.id);
  
  console.log(`Found ${toUnassign.length} leads to unassign out of ${leads.length}.`);
  
  if (toUnassign.length > 0) {
    // Process in batches
    const batchSize = 1000;
    for (let i = 0; i < toUnassign.length; i += batchSize) {
      const batch = toUnassign.slice(i, i + batchSize);
      await prisma.leadSnapshot.updateMany({
        where: { id: { in: batch } },
        data: { partnerId: null }
      });
      console.log(`Processed batch ${i / batchSize + 1}`);
    }
  }
  
  console.log('Cleanup complete.');
  await prisma.$disconnect();
}
bootstrap();
