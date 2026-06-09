import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'ref_15_0@example.com' },
    include: { partner: true }
  });

  console.log('User:', user);
  
  if (user && user.partnerId) {
    const deals = await prisma.leadSnapshot.findMany({
      where: { partnerId: user.partnerId }
    });
    console.log('Deals for partnerId', user.partnerId, ':', deals.length);
  }
}

main().finally(() => prisma.$disconnect());
