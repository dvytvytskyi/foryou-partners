
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function configureKlikov() {
  const partner = await prisma.partner.findFirst({
    where: { name: 'Klikov' }
  });

  if (!partner) {
    console.error('Partner Klikov not found');
    return;
  }

  const pipelineId = BigInt('10776450');

  await prisma.partnerPipeline.upsert({
    where: {
      partnerId_amocrmPipelineId: {
        partnerId: partner.id,
        amocrmPipelineId: pipelineId
      }
    },
    update: {},
    create: {
      partnerId: partner.id,
      amocrmPipelineId: pipelineId
    }
  });

  console.log(`✅ Klikov partner (id: ${partner.id}) configured for pipeline: ${pipelineId}`);
}

configureKlikov().finally(() => prisma.$disconnect());
