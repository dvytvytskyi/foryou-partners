const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.partnerPipeline.count();
  console.log('PartnerPipeline count:', count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
