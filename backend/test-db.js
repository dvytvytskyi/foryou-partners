const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.leadSnapshot.count();
  const sum = await prisma.leadSnapshot.aggregate({ _sum: { budget: true } });
  console.log('Total Leads:', count);
  console.log('Total Revenue:', sum._sum.budget);
  
  const wonCount = await prisma.leadSnapshot.count({
    where: { status: { contains: '142' } }
  });
  console.log('Won Deals:', wonCount);
}

main().catch(console.error).finally(() => prisma.$disconnect());
