import { PrismaClient } from '@prisma/client';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AmoService } from './src/amo/amo.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaClient);
  const amoService = app.get(AmoService);

  const admin = await prisma.user.findFirst({ where: { email: 'admin@foryou-realestate.com' }});
  if (!admin || !admin.partnerId) {
    console.log('Admin partner not found');
    return;
  }
  const partnerId = admin.partnerId;

  console.log('Fetching tags and pipelines...');
  const tags = await amoService.getAvailableTags();
  const pipelines = await amoService.getCachedPipelines();
  
  if (tags.length > 0) {
    try {
      await prisma.partnerTag.create({
        data: { partnerId, amocrmTagId: BigInt(tags[0].id) }
      });
      console.log(`Bound tag ${tags[0].name} to admin`);
    } catch (e) {}
  }
  
  if (pipelines.length > 0) {
    try {
      await prisma.partnerPipeline.create({
        data: { partnerId, amocrmPipelineId: BigInt(pipelines[0].id) }
      });
      console.log(`Bound pipeline ${pipelines[0].name} to admin`);
    } catch (e) {}
  }

  console.log('Running amoCRM backfill...');
  const result = await amoService.runBackfill();
  console.log('Backfill result:', result);

  await app.close();
}
bootstrap();
