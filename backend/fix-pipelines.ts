import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.leadSnapshot.updateMany({
    data: {
      pipelineId: 8696950n
    }
  });
  console.log('Fixed pipeline IDs!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
