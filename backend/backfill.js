const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  // Let's just update the broker for all leads that are missing it to 'Daniil' for testing
  await prisma.leadSnapshot.updateMany({
    where: { brokerName: null },
    data: { brokerName: 'Даниил', brokerEmail: 'daniil@foryou.ae' }
  });
  console.log("Updated brokers!");
}
run().catch(console.error).finally(() => prisma.$disconnect());
