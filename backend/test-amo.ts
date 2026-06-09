import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AmoService } from './src/amo/amo.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const amoService = app.get(AmoService);
  const configService = app.get(ConfigService);
  const domain = configService.get('AMO_DOMAIN');
  
  // Try to fetch custom fields
  const accessToken = await amoService['getAccessToken']();
  const res = await fetch(`https://${domain}/api/v4/leads/custom_fields`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const data = await res.json();
  const fields = data._embedded?.custom_fields || [];
  
  const targetFields = fields.filter(f => ['Источник', 'Город', 'Комментарий'].includes(f.name));
  console.log(JSON.stringify(targetFields, null, 2));
  
  await app.close();
}
bootstrap();
