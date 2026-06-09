import { PrismaClient } from '@prisma/client';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AmoService } from './src/amo/amo.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaClient);
  const amoService = app.get(AmoService);

  const klikov = await prisma.partner.findFirst();
  if (!klikov) {
    console.log('Partner not found');
    return;
  }
  const partnerId = klikov.id;

  console.log('Fetching pipelines...');
  const pipelines = await amoService.getCachedPipelines();
  
  if (pipelines.length > 0) {
    try {
      await prisma.partnerPipeline.create({
        data: { partnerId, amocrmPipelineId: BigInt(pipelines[0].id) }
      });
      console.log(`Bound pipeline ${pipelines[0].name} to Klikov`);
    } catch (e) {}
  }

  // Adding a general catch-all for source
  try {
    await prisma.partnerSource.create({
      data: { partnerId, amocrmSource: 'telegram' }
    });
    console.log(`Bound source telegram to Klikov`);
  } catch(e) {}
  
  console.log('Running amoCRM backfill...');
  const result = await amoService.runBackfill();
  console.log('Backfill result:', result);

  await app.close();
}
bootstrap();
