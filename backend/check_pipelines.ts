import { AmoService } from './src/amo/amo.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const amo = app.get(AmoService);
  
  const token = await amo.getAmoAccessTokenPublic();
  const domain = process.env.AMO_DOMAIN;
  
  const res = await fetch(`https://${domain}/api/v4/leads/pipelines/8600274`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const data = await res.json();
  console.log(JSON.stringify(data._embedded?.statuses?.map(s => ({ id: s.id, name: s.name })), null, 2));
  
  await app.close();
}
bootstrap();
