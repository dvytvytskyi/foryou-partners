import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.leadSnapshot.deleteMany({
    where: {
      externalLeadId: { in: [999111n, 999222n] }
    }
  });
  console.log('Test leads deleted!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
