const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sample = await prisma.leadStatusHistory.findFirst();
  console.log('Sample history:', sample);
}
main().catch(console.error).finally(() => prisma.$disconnect());
