import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const partner = await prisma.partner.findFirst();
  if (!partner) return;

  const leads = [
    { externalLeadId: 47602932n, partnerId: partner.id, title: 'Андрій Мельник', status: '8696950:74717798', budget: 500000, city: 'Dubai', contactName: 'Андрій Мельник', contactPhone: '+380671112233', amocrmSource: 'telegram', syncedAt: new Date(), createdAtSource: new Date(), updatedAtSource: new Date() },
    { externalLeadId: 47602934n, partnerId: partner.id, title: 'Олена Коваленко', status: '8696950:74717802', budget: 800000, city: 'Abu Dhabi', contactName: 'Олена Коваленко', contactPhone: '+380509998877', amocrmSource: 'website', syncedAt: new Date(), createdAtSource: new Date(), updatedAtSource: new Date() },
    { externalLeadId: 47602936n, partnerId: partner.id, title: 'Василь Стус', status: '8696950:74717810', budget: 1200000, city: 'Dubai', contactName: 'Василь Стус', contactPhone: '+380635554433', amocrmSource: 'instagram', syncedAt: new Date(), createdAtSource: new Date(), updatedAtSource: new Date() },
    { externalLeadId: 47602938n, partnerId: partner.id, title: 'Наталія Полтавка', status: '8696950:142', budget: 350000, city: 'Ras Al Khaimah', contactName: 'Наталія Полтавка', contactPhone: '+380978887766', amocrmSource: 'telegram', syncedAt: new Date(), createdAtSource: new Date(), updatedAtSource: new Date() },
    { externalLeadId: 47602940n, partnerId: partner.id, title: 'Богдан Хмельницький', status: '8696950:143', budget: 2500000, city: 'Dubai', contactName: 'Богдан Хмельницький', contactPhone: '+380661234567', amocrmSource: 'website', syncedAt: new Date(), createdAtSource: new Date(), updatedAtSource: new Date() },
  ];

  for (const lead of leads) {
    await prisma.leadSnapshot.create({ data: lead });
  }
  console.log('5 leads successfully mapped to local DB.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
