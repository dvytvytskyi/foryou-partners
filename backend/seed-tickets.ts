import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const partner = await prisma.partner.findFirst();
  if (!partner) {
    console.log('No partner found');
    return;
  }

  const user = await prisma.user.findFirst({ where: { partnerId: partner.id } });
  if (!user) {
    console.log('No partner user found');
    return;
  }

  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!admin) {
    console.log('No admin found');
    return;
  }

  // Create test tickets
  await prisma.ticket.create({
    data: {
      partnerId: partner.id,
      subject: 'Не пришла выплата за сделку #1029',
      status: 'OPEN',
      messages: {
        create: {
          senderId: user.id,
          message: 'Здравствуйте! Я закрыл сделку неделю назад, но выплата так и не пришла. Подскажите, когда ожидать?',
        }
      }
    }
  });

  await prisma.ticket.create({
    data: {
      partnerId: partner.id,
      subject: 'Как поменять пароль?',
      status: 'RESOLVED',
      messages: {
        create: [
          {
            senderId: user.id,
            message: 'Добрый день, где в интерфейсе меняется пароль?',
          },
          {
            senderId: admin.id,
            message: 'Здравствуйте! Пароль можно поменять в разделе "Настройки" (иконка шестеренки внизу меню).',
          }
        ]
      }
    }
  });

  console.log('Test tickets created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
