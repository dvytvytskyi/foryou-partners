import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AmoService } from './src/amo/amo.service';
import { PrismaClient } from '@prisma/client';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const amoService = app.get(AmoService);
  const prisma = new PrismaClient();

  const partner = await prisma.partner.findFirst();
  if (!partner) return;

  const leadsToCreate = [
    { name: 'William Shakespeare', phone: '+971501230001', email: 'william.s@example.com', budget: 1800000, comment: 'Нужна просторная вилла', city: 'Dubai', partnerName: partner.name, title: 'Покупка виллы (Arabian Ranches)' },
    { name: 'Tom Hanks', phone: '+971501230002', email: 'tom.h@example.com', budget: 650000, comment: 'Апартаменты под инвестиции', city: 'Dubai', partnerName: partner.name, title: 'Инвестиция в JVC' },
    { name: 'Meryl Streep', phone: '+971501230003', email: 'meryl.s@example.com', budget: 2200000, comment: 'Пентхаус с хорошим видом', city: 'Dubai', partnerName: partner.name, title: 'Пентхаус (Marina)' },
    { name: 'Brad Pitt', phone: '+971501230004', email: 'brad.p@example.com', budget: 1100000, comment: 'Покупка таунхауса', city: 'Abu Dhabi', partnerName: partner.name, title: 'Таунхаус (Yas Island)' },
    { name: 'Angelina Jolie', phone: '+971501230005', email: 'angelina.j@example.com', budget: 3500000, comment: 'Эксклюзивная вилла', city: 'Dubai', partnerName: partner.name, title: 'Элитная вилла (Palm Jumeirah)' },
    { name: 'Leonardo DiCaprio', phone: '+971501230006', email: 'leo.d@example.com', budget: 950000, comment: 'Дом для отдыха', city: 'Ras Al Khaimah', partnerName: partner.name, title: 'Дом у моря' },
    { name: 'Scarlett Johansson', phone: '+971501230007', email: 'scarlett.j@example.com', budget: 850000, comment: 'Аренда коммерции', city: 'Dubai', partnerName: partner.name, title: 'Аренда офиса (DIFC)' },
    { name: 'Chris Hemsworth', phone: '+971501230008', email: 'chris.h@example.com', budget: 1400000, comment: 'Квартира для семьи', city: 'Abu Dhabi', partnerName: partner.name, title: 'Семейные апартаменты' },
    { name: 'Natalie Portman', phone: '+971501230009', email: 'natalie.p@example.com', budget: 450000, comment: 'Инвестиции в Off-plan', city: 'Dubai', partnerName: partner.name, title: 'Off-plan инвестиция' },
    { name: 'Robert Downey Jr.', phone: '+971501230010', email: 'robert.d@example.com', budget: 5500000, comment: 'Коммерческое здание', city: 'Dubai', partnerName: partner.name, title: 'Покупка здания' }
  ];

  console.log('Создаем 10 новых сделок...');

  for (let i = 0; i < leadsToCreate.length; i++) {
    const leadData = leadsToCreate[i];
    try {
      const result = await amoService.createAmoLead({
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email,
        budget: leadData.budget,
        comment: leadData.comment,
        city: leadData.city,
        partnerName: leadData.partnerName,
      });

      console.log(`✅ Лід ${i + 1} створено в amoCRM! ID: ${result.externalLeadId}`);

      const token = await amoService['getAccessToken']();
      const domain = process.env.AMO_API_DOMAIN || 'reforyou.amocrm.ru';
      await fetch(`https://${domain}/api/v4/leads`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([{ id: result.externalLeadId, name: leadData.title }])
      });

      await prisma.leadSnapshot.create({
        data: {
          externalLeadId: BigInt(result.externalLeadId),
          partnerId: partner.id,
          title: leadData.title,
          status: '8696950:74717798', 
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
      console.error(`❌ Помилка:`, err.message);
    }
  }

  await prisma.$disconnect();
  await app.close();
}
bootstrap();
