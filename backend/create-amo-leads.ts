import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AmoService } from './src/amo/amo.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const amoService = app.get(AmoService);

  const leadsToCreate = [
    {
      name: 'Андрій Мельник',
      phone: '+380671112233',
      email: 'andrii.test@example.com',
      budget: 500000,
      comment: 'Заявка з локального середовища 1',
      city: 'Dubai',
      partnerName: 'Test Admin',
    },
    {
      name: 'Олена Коваленко',
      phone: '+380509998877',
      email: 'olena.test@example.com',
      budget: 800000,
      comment: 'Заявка з локального середовища 2',
      city: 'Abu Dhabi',
      partnerName: 'Test Admin',
    },
    {
      name: 'Василь Стус',
      phone: '+380635554433',
      email: 'vasyl.test@example.com',
      budget: 1200000,
      comment: 'Заявка з локального середовища 3',
      city: 'Dubai',
      partnerName: 'Test Admin',
    },
    {
      name: 'Наталія Полтавка',
      phone: '+380978887766',
      email: 'natalia.test@example.com',
      budget: 350000,
      comment: 'Заявка з локального середовища 4',
      city: 'Ras Al Khaimah',
      partnerName: 'Test Admin',
    },
    {
      name: 'Богдан Хмельницький',
      phone: '+380661234567',
      email: 'bohdan.test@example.com',
      budget: 2500000,
      comment: 'Заявка з локального середовища 5',
      city: 'Dubai',
      partnerName: 'Test Admin',
    }
  ];

  console.log('Починаємо створення 5 лідів в amoCRM...');

  for (let i = 0; i < leadsToCreate.length; i++) {
    try {
      const result = await amoService.createAmoLead(leadsToCreate[i]);
      console.log(`✅ Лід ${i + 1} створено успішно! ID в amoCRM: ${result.externalLeadId}`);
    } catch (err) {
      console.error(`❌ Помилка створення ліда ${i + 1}:`, err.message);
    }
  }

  await app.close();
}
bootstrap();
