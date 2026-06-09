const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const counts = await prisma.leadStatusHistory.groupBy({
    by: ['toStatus'],
    _count: true
  });
  console.log(counts);
}
main().catch(console.error).finally(() => prisma.$disconnect());
