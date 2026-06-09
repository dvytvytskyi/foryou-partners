import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const partner = await prisma.partner.findFirst();
  if (!partner) {
    console.log('No partner found');
    return;
  }

  await prisma.leadSnapshot.create({
    data: {
      externalLeadId: 999111n,
      partnerId: partner.id,
      title: 'Тестовий Лід 1 (Дубай)',
      status: 'new',
      budget: 1500000,
      city: 'Dubai',
      contactName: 'Іван Франко',
      contactPhone: '+380501234567',
      amocrmSource: 'website',
      syncedAt: new Date(),
      createdAtSource: new Date(),
      updatedAtSource: new Date()
    }
  });

  await prisma.leadSnapshot.create({
    data: {
      externalLeadId: 999222n,
      partnerId: partner.id,
      title: 'Тестовий Лід 2 (Абу-Даби)',
      status: 'active',
      budget: 850000,
      city: 'Abu Dhabi',
      contactName: 'Леся Українка',
      contactPhone: '+380671234567',
      amocrmSource: 'telegram',
      syncedAt: new Date(),
      createdAtSource: new Date(),
      updatedAtSource: new Date()
    }
  });
  console.log('2 test leads inserted for partner: ' + partner.name);
}
main().catch(console.error).finally(() => prisma.$disconnect());
