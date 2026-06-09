import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AmoService } from './src/amo/amo.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const amoService = app.get(AmoService);
  const configService = app.get(ConfigService);
  
  const accessToken = await (amoService as any).getAccessToken();
  const domain = configService.get('AMO_API_DOMAIN') || 'reforyou.amocrm.ru';
  
  const pipelineId = 10776450;
  const response = await fetch(`https://${domain}/api/v4/leads?filter[pipeline_id][]=${pipelineId}&limit=1`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  const data = await response.json() as any;
  console.log(`TOTAL LEADS in Pipeline ${pipelineId}:`, data._total_items);
  
  await app.close();
}
bootstrap();
