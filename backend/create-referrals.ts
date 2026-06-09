import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { role: 'partner_user' },
    include: { partner: true }
  });

  if (!user || !user.partnerId) {
    console.error("No partner user found");
    return;
  }

  const partnerId = user.partnerId;
  console.log(`Creating referrals for partner: ${user.partner?.name} (ID: ${partnerId})`);

  // Create 3 referred partners
  for (let i = 1; i <= 3; i++) {
    const newPartner = await prisma.partner.create({
      data: {
        name: `Referred Partner ${i}`,
        isActive: true,
        referredById: partnerId,
        labels: [],
      }
    });

    console.log(`Created referred partner: ${newPartner.name}`);

    // Create a closed lead for the new partner
    await prisma.leadSnapshot.create({
      data: {
        externalLeadId: BigInt(Date.now() + i),
        partnerId: newPartner.id,
        title: `Referred Deal ${i}`,
        status: '142', // Success status
        budget: 500000 + (i * 100000),
        city: 'Dubai',
        updatedAtSource: new Date(),
        syncedAt: new Date()
      }
    });

    // Create commission for the referrer
    await prisma.commission.create({
      data: {
        partnerId: partnerId,
        amount: 2500 + (i * 500),
        currency: 'AED',
        type: 'REFERRAL',
        status: i === 1 ? 'AVAILABLE' : 'PAID',
        description: `Referral bonus from ${newPartner.name}`
      }
    });
  }

  console.log("Test referrals created successfully!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
