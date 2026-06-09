import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AmoService } from './src/amo/amo.service';
import { PrismaClient } from '@prisma/client';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const amoService = app.get(AmoService);
  const prisma = new PrismaClient(); // USE NEW INSTANCE!

  const partner = await prisma.partner.findFirst();
  if (!partner) {
    console.log('No partner found!');
    return;
  }

  const leadsToCreate = [
    {
      name: 'Oliver Twist',
      phone: '+971501112233',
      email: 'oliver.t@example.com',
      budget: 1500000,
      comment: 'Интересуется пентхаусом в Downtown',
      city: 'Dubai',
      partnerName: partner.name,
      title: 'Покупка пентхауса (Downtown)'
    },
    {
      name: 'Emma Watson',
      phone: '+971509998877',
      email: 'emma.w@example.com',
      budget: 450000,
      comment: 'Ищет квартиру для сдачи в аренду',
      city: 'Dubai',
      partnerName: partner.name,
      title: 'Инвестиция в JVT'
    },
    {
      name: 'Liam Neeson',
      phone: '+971561234567',
      email: 'liam.n@example.com',
      budget: 2000000,
      comment: 'Нужна вилла с видом на море',
      city: 'Abu Dhabi',
      partnerName: partner.name,
      title: 'Покупка виллы (Saadiyat)'
    },
    {
      name: 'Sophia Loren',
      phone: '+971554443322',
      email: 'sophia.l@example.com',
      budget: 900000,
      comment: 'Коммерческая недвижимость под офис',
      city: 'Dubai',
      partnerName: partner.name,
      title: 'Офис (Business Bay)'
    },
    {
      name: 'James Bond',
      phone: '+971500070007',
      email: 'james.b@example.com',
      budget: 3500000,
      comment: 'Элитная недвижимость',
      city: 'Dubai',
      partnerName: partner.name,
      title: 'Покупка особняка (Emirates Hills)'
    }
  ];

  console.log('Починаємо створення 5 нових лідів в amoCRM та локальній БД...');

  for (let i = 0; i < leadsToCreate.length; i++) {
    const leadData = leadsToCreate[i];
    try {
      // 1. Створюємо в amoCRM
      const result = await amoService.createAmoLead({
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email,
        budget: leadData.budget,
        comment: leadData.comment,
        city: leadData.city,
        partnerName: leadData.partnerName,
      });

      console.log(`✅ Лід ${i + 1} створено успішно в amoCRM! ID: ${result.externalLeadId}`);

      // Щоб назва угоди була російською (amoService за замовчуванням ставить "Заявка от партнера: ...")
      // Ми можемо оновити назву угоди через PATCH
      const token = await amoService['getAccessToken']();
      const domain = process.env.AMO_API_DOMAIN || 'reforyou.amocrm.ru';
      await fetch(`https://${domain}/api/v4/leads`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([{ id: result.externalLeadId, name: leadData.title }])
      });

      // 2. Зберігаємо в локальну БД для дашборду
      await prisma.leadSnapshot.create({
        data: {
          externalLeadId: BigInt(result.externalLeadId),
          partnerId: partner.id,
          title: leadData.title,
          status: '8696950:74717798', // Первинний контакт
          pipelineId: 8696950n,
          budget: leadData.budget,
          city: leadData.city,
          contactName: leadData.name,
          contactPhone: leadData.phone,
          amocrmSource: 'website',
          syncedAt: new Date(),
          createdAtSource: new Date(),
          updatedAtSource: new Date()
        }
      });
      console.log(`✅ Лід ${i + 1} додано в локальну БД!`);

    } catch (err) {
      console.error(`❌ Помилка створення ліда ${i + 1}:`, err.message);
    }
  }

  await prisma.$disconnect();
  await app.close();
}
bootstrap();
