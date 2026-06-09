import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'ref_15_0@example.com' },
    include: { partner: true }
  });

  if (!user || !user.partnerId) {
    console.log('User or Partner not found');
    return;
  }

  const pId = user.partnerId;

  await prisma.leadSnapshot.createMany({
    data: [
      {
        externalLeadId: 91001n,
        partnerId: pId,
        title: 'Квартира в Downtown Dubai',
        status: 'Переговоры',
        budget: 1200000,
        createdAtSource: new Date(),
        updatedAtSource: new Date(),
        syncedAt: new Date(),
      },
      {
        externalLeadId: 91002n,
        partnerId: pId,
        title: 'Вилла в Arabian Ranches',
        status: 'Принимают решение',
        budget: 3500000,
        createdAtSource: new Date(),
        updatedAtSource: new Date(),
        syncedAt: new Date(),
      },
      {
        externalLeadId: 91003n,
        partnerId: pId,
        title: 'Апартаменты на Bluewaters',
        status: 'Первичный контакт',
        budget: 2800000,
        createdAtSource: new Date(),
        updatedAtSource: new Date(),
        syncedAt: new Date(),
      },
      {
        externalLeadId: 91004n,
        partnerId: pId,
        title: 'Офис в Business Bay',
        status: 'Успешно реализовано',
        budget: 850000,
        createdAtSource: new Date(),
        updatedAtSource: new Date(),
        syncedAt: new Date(),
      },
      {
        externalLeadId: 91005n,
        partnerId: pId,
        title: 'Пентхаус в JLT',
        status: 'Закрыто и не реализовано',
        budget: 5000000,
        createdAtSource: new Date(),
        updatedAtSource: new Date(),
        syncedAt: new Date(),
      }
    ]
  });

  console.log('5 deals added to partner of ref_15_0@example.com');
}

main().finally(() => prisma.$disconnect());
