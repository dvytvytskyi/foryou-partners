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
  
  let page = 1;
  let total = 0;
  while (true) {
    const res = await fetch(`https://${domain}/api/v4/leads?filter[pipeline_id][]=${pipelineId}&limit=250&page=${page}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (res.status === 204) break;
    const data = await res.json() as any;
    const leads = data._embedded?.leads || [];
    if (leads.length === 0) break;
    total += leads.length;
    console.log(`Page ${page}: ${leads.length} leads (Total so far: ${total})`);
    if (!data._links?.next) break;
    page++;
  }
  console.log('FINAL TOTAL:', total);
  await app.close();
}
bootstrap();
