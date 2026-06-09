import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'ref_15_0@example.com' },
  });

  if (!user || !user.partnerId) {
    console.log('User or Partner not found');
    return;
  }

  const pId = user.partnerId;

  // 1. Move old fake leads to closed
  await prisma.leadSnapshot.updateMany({
    where: { 
      externalLeadId: { in: [90001n, 90002n, 91001n, 91002n, 91003n, 91004n, 91005n] }
    },
    data: {
      status: '8696950:143', // Closed / Not realized
      pipelineId: 8696950n,
      updatedAtSource: new Date(),
    }
  });
  console.log('Moved old deals to closed');

  // 2. Create new deals in different stages
  await prisma.leadSnapshot.createMany({
    data: [
      {
        externalLeadId: 92001n,
        partnerId: pId,
        title: 'Квартира в Downtown Dubai (Новая)',
        status: '8696950:74717798', // Первинний контакт
        pipelineId: 8696950n,
        budget: 1300000,
        createdAtSource: new Date(),
        updatedAtSource: new Date(),
        syncedAt: new Date(),
      },
      {
        externalLeadId: 92002n,
        partnerId: pId,
        title: 'Вилла в Arabian Ranches (Новая)',
        status: '8696950:74717802', // Переговори
        pipelineId: 8696950n,
        budget: 3600000,
        createdAtSource: new Date(),
        updatedAtSource: new Date(),
        syncedAt: new Date(),
      },
      {
        externalLeadId: 92003n,
        partnerId: pId,
        title: 'Апартаменты на Bluewaters (Новая)',
        status: '8696950:74717806', // Прийняття рішення
        pipelineId: 8696950n,
        budget: 2900000,
        createdAtSource: new Date(),
        updatedAtSource: new Date(),
        syncedAt: new Date(),
      },
      {
        externalLeadId: 92004n,
        partnerId: pId,
        title: 'Офис в Business Bay (Новый)',
        status: '8696950:74717810', // Завдаток
        pipelineId: 8696950n,
        budget: 900000,
        createdAtSource: new Date(),
        updatedAtSource: new Date(),
        syncedAt: new Date(),
      },
      {
        externalLeadId: 92005n,
        partnerId: pId,
        title: 'Пентхаус в JLT (Новый)',
        status: '8696950:142', // Успішно
        pipelineId: 8696950n,
        budget: 5200000,
        createdAtSource: new Date(),
        updatedAtSource: new Date(),
        syncedAt: new Date(),
      }
    ]
  });

  console.log('Created new deals in different stages of 8696950 pipeline');
}

main().finally(() => prisma.$disconnect());
