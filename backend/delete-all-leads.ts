import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.leadSnapshot.deleteMany({});
  console.log('All test leads deleted!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
