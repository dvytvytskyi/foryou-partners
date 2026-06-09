const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { subDays } = require('date-fns');

async function main() {
  let startDate = subDays(new Date(), 30);
  let endDate = new Date();
  endDate = new Date(endDate.setHours(23, 59, 59, 999));
  
  const dateFilter = { updatedAtSource: { gte: startDate, lte: endDate } };
  
  console.log('Date filter:', dateFilter);

  const count = await prisma.leadSnapshot.count({ where: dateFilter });
  const sum = await prisma.leadSnapshot.aggregate({ where: dateFilter, _sum: { budget: true } });
  
  console.log('Count:', count);
  console.log('Sum:', sum._sum.budget);
}

main().catch(console.error).finally(() => prisma.$disconnect());
