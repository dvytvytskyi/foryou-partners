import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AmoService } from './src/amo/amo.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const amoService = app.get(AmoService);
  const domain = process.env.AMO_DOMAIN;
  const token = await (amoService as any).getAccessToken();
  
  const res = await fetch(`https://${domain}/api/v4/leads/custom_fields`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const fields = data._embedded?.custom_fields?.map((f: any) => ({id: f.id, name: f.name, type: f.type, enums: f.enums})) || [];
  console.log(JSON.stringify(fields, null, 2));
  
  await app.close();
}
bootstrap();
