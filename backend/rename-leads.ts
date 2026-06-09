import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const leadsData = [
    { id: 47602932n, name: 'John Smith', title: 'Аренда виллы (Palm Jumeirah)' },
    { id: 47602934n, name: 'Michael Johnson', title: 'Покупка апартаментов (Marina)' },
    { id: 47602936n, name: 'David Williams', title: 'Инвестиция в новостройку (Yas Island)' },
    { id: 47602938n, name: 'Sarah Brown', title: 'Покупка недвижимости (Ras Al Khaimah)' },
    { id: 47602940n, name: 'Emily Davis', title: 'Аренда квартиры (Dubai)' }
  ];

  for (const lead of leadsData) {
    await prisma.leadSnapshot.updateMany({
      where: { externalLeadId: lead.id },
      data: {
        contactName: lead.name,
        title: lead.title
      }
    });
  }

  console.log('Updated leads in DB to English names and Russian titles!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
