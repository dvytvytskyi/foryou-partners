
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const partnerCount = await prisma.partner.count();
    const userCount = await prisma.user.count();
    const leadCount = await prisma.leadSnapshot.count();
    const webhookCount = await prisma.webhookEvent.count();
    const tagCount = await prisma.partnerTag.count();
    const sourceCount = await prisma.partnerSource.count();

    console.log({
      partnerCount,
      userCount,
      leadCount,
      webhookCount,
      tagCount,
      sourceCount
    });

    const webhooks = await prisma.webhookEvent.findMany({
      take: 5,
      orderBy: { receivedAt: 'desc' }
    });
    console.log('Last 5 webhooks:', JSON.stringify(webhooks, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    , 2));

    const partners = await prisma.partner.findMany({
      include: {
        tags: true,
        sources: true
      }
    });
    console.log('Partners:', JSON.stringify(partners, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    , 2));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
