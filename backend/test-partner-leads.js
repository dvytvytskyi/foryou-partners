const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allLeads = await prisma.leadSnapshot.count();
  const partnerLeads = await prisma.leadSnapshot.count({
    where: { partnerId: { not: null } }
  });
  console.log('All leads:', allLeads);
  console.log('Partner leads:', partnerLeads);
}

main().catch(console.error).finally(() => prisma.$disconnect());
