import { PrismaClient } from '@prisma/client';

async function bootstrap() {
  const prisma = new PrismaClient();
  const klikovId = 'dcf2713e-22a9-464a-8bad-5a0c8c182562';
  const allowedPipelines = [10776450n, 8550470n];
  const allowedSource = 'Klykov leads';
  
  console.log('Starting cleanup of Klikov leads...');
  
  // Unassign leads that don't match the rules
  const result = await prisma.leadSnapshot.updateMany({
    where: {
      partnerId: klikovId,
      NOT: {
        OR: [
          { pipelineId: { in: allowedPipelines } },
          { amocrmSource: allowedSource }
        ]
      }
    },
    data: {
      partnerId: null
    }
  });
  
  console.log(`Unassigned ${result.count} leads from Klikov.`);
  
  const totalKlikov = await prisma.leadSnapshot.count({ where: { partnerId: klikovId } });
  console.log(`Klikov now has ${totalKlikov} leads.`);
  
  await prisma.$disconnect();
}
bootstrap();
