const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const partners = await prisma.partner.findMany();
  console.log('Partners:', partners);
}

main().catch(console.error).finally(() => prisma.$disconnect());
