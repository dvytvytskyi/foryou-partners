import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AmoService } from './src/amo/amo.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const amoService = app.get(AmoService);
  const pipelines = await amoService.getCachedPipelines();
  console.log(JSON.stringify(pipelines, null, 2));
  await app.close();
}
bootstrap();
