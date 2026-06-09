const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const realEstate = await prisma.leadSnapshot.count({ where: { status: { startsWith: '8696950:' } } });
  const klikov = await prisma.leadSnapshot.count({ where: { status: { startsWith: '10776450:' } } });
  const other = await prisma.leadSnapshot.count({ where: { 
    NOT: [
      { status: { startsWith: '8696950:' } },
      { status: { startsWith: '10776450:' } }
    ]
  } });
  console.log('Real Estate:', realEstate);
  console.log('Klikov:', klikov);
  console.log('Other:', other);
}
main().catch(console.error).finally(() => prisma.$disconnect());
