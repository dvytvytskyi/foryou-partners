const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const pp = await prisma.partnerPipeline.findMany();
  console.log(pp);
}
main().catch(console.error).finally(() => prisma.$disconnect());
