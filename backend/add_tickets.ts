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

  await prisma.ticket.createMany({
    data: [
      {
        partnerId: pId,
        subject: 'Вопрос по комиссии за виллу',
        status: 'OPEN',
        updatedAt: new Date(),
      },
      {
        partnerId: pId,
        subject: 'Не могу добавить клиента из Франции',
        status: 'IN_PROGRESS',
        updatedAt: new Date(),
      },
      {
        partnerId: pId,
        subject: 'Просьба обновить статус сделки #91004',
        status: 'RESOLVED',
        updatedAt: new Date(),
      },
      {
        partnerId: pId,
        subject: 'Как изменить номер телефона в профиле?',
        status: 'CLOSED',
        updatedAt: new Date(),
      }
    ]
  });

  console.log('4 test tickets added to partner of ref_15_0@example.com');
}

main().finally(() => prisma.$disconnect());
