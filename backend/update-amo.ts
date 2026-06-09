import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AmoService } from './src/amo/amo.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const amoService = app.get(AmoService);
  
  const token = await amoService['getAccessToken']();
  const domain = process.env.AMO_API_DOMAIN || 'reforyou.amocrm.ru';

  const leads = [
    { id: 47602932, name: 'John Smith', title: 'Аренда виллы (Palm Jumeirah)' },
    { id: 47602934, name: 'Michael Johnson', title: 'Покупка апартаментов (Marina)' },
    { id: 47602936, name: 'David Williams', title: 'Инвестиция в новостройку (Yas Island)' },
    { id: 47602938, name: 'Sarah Brown', title: 'Покупка недвижимости (Ras Al Khaimah)' },
    { id: 47602940, name: 'Emily Davis', title: 'Аренда квартиры (Dubai)' }
  ];

  console.log('Updating leads in amoCRM...');
  const res1 = await fetch(`https://${domain}/api/v4/leads`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(leads.map(l => ({ id: l.id, name: l.title })))
  });
  console.log('Lead titles update status:', res1.status);

  console.log('Fetching contacts for leads and updating names...');
  for (const l of leads) {
    const res2 = await fetch(`https://${domain}/api/v4/leads/${l.id}?with=contacts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res2.ok) continue;
    const data = await res2.json();
    const contact = data._embedded?.contacts?.[0];
    if (contact) {
      const res3 = await fetch(`https://${domain}/api/v4/contacts`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([{ id: contact.id, name: l.name }])
      });
      console.log(`Updated contact for lead ${l.id}, status:`, res3.status);
    }
  }

  console.log('Done updating amoCRM!');
  await app.close();
}
bootstrap();
