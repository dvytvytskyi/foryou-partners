import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AmoService } from '../src/amo/amo.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const amoService = app.get(AmoService);
  const configService = app.get(ConfigService);
  
  const accessToken = await (amoService as any).getAmoAccessToken();
  const domain = configService.get('AMO_API_DOMAIN') || 'reforyou.amocrm.ru';
  
  const response = await fetch(`https://${domain}/api/v4/leads/pipelines`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  const data = await response.json() as any;
  const pipelines = data._embedded.pipelines;
  
  console.log('Pipelines and their sort order:');
  pipelines.sort((a: any, b: any) => a.sort - b.sort).forEach((p: any) => {
    console.log(`  ${p.id}: ${p.name} (sort: ${p.sort})`);
  });
  
  await app.close();
}
bootstrap();
