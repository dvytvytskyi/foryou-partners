import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AmoService } from './src/amo/amo.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const amoService = app.get(AmoService);
  const pipelineId = 10776450;
  
  console.log(`Starting sync for pipeline ${pipelineId} (Klykov leads)...`);
  await amoService.syncLeadsByPipeline(pipelineId);
  console.log('Sync finished.');
  
  await app.close();
}
bootstrap();
