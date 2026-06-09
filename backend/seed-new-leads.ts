import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  
  // Find any partner to attach these leads to
  const partner = await prisma.partner.findFirst();
  if (!partner) {
    console.log('No partner found to attach leads to.');
    return;
  }

  const leads = [
    {
      externalLeadId: 555001n,
      partnerId: partner.id,
      title: 'Оренда вілли (Palm Jumeirah)',
      status: '8696950:74717802', // Переговори
      budget: 350000,
      city: 'Dubai',
      contactName: 'Олександр Петренко',
      contactPhone: '+380679998877',
      amocrmSource: 'website',
      syncedAt: new Date(),
      createdAtSource: new Date(),
      updatedAtSource: new Date()
    },
    {
      externalLeadId: 555002n,
      partnerId: partner.id,
      title: 'Купівля апартаментів (Marina)',
      status: '8696950:74717810', // Завдаток
      budget: 1200000,
      city: 'Dubai',
      contactName: 'Марія Коваль',
      contactPhone: '+380501112233',
      amocrmSource: 'telegram',
      syncedAt: new Date(),
      createdAtSource: new Date(),
      updatedAtSource: new Date()
    },
    {
      externalLeadId: 555003n,
      partnerId: partner.id,
      title: 'Інвестиція в новобудову (Yas Island)',
      status: '8696950:74717798', // Первинний контакт
      budget: 850000,
      city: 'Abu Dhabi',
      contactName: 'Дмитро Шевченко',
      contactPhone: '+380934445566',
      amocrmSource: 'instagram',
      syncedAt: new Date(),
      createdAtSource: new Date(),
      updatedAtSource: new Date()
    }
  ];

  for (const lead of leads) {
    await prisma.leadSnapshot.create({ data: lead });
  }

  console.log('3 new test leads inserted successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
