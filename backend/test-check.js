const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const c = await prisma.leadStatusHistory.count({
    where: { toStatus: { in: ['10776450:84853590', '10776450:84853926', '8696950:74717798'] } }
  });
  console.log('Restricted statuses count:', c);
  const partners = await prisma.partner.count();
  console.log('Partners count:', partners);
}
main().catch(console.error).finally(() => prisma.$disconnect());
