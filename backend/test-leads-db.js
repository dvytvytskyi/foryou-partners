const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const leads = await prisma.leadSnapshot.findMany({
    take: 5,
    orderBy: { externalLeadId: 'desc' }
  });
  console.log(leads.map(l => l.externalLeadId));
  process.exit(0);
}
run();
