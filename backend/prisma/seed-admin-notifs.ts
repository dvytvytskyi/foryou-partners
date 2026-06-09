import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@foryou-realestate.com' }
  });

  if (!adminUser) {
    console.log('Admin user not found');
    return;
  }

  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        type: 'NEW_PARTNER',
        title: 'Новий партнер',
        message: 'Зареєструвався новий партнер: Олексій Смирнов. Прив\'яжіть йому теги.',
        link: '/admin/partners',
        isRead: false,
      },
      {
        userId: adminUser.id,
        type: 'SYSTEM_ALERT',
        title: 'Запит на виплату',
        message: 'Партнер Test Partner 15 запросив виплату на суму 5,000 AED.',
        link: '/payouts',
        isRead: false,
      }
    ]
  });
  console.log('Admin notifications seeded!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
