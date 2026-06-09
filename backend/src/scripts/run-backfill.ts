import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AmoService } from '../amo/amo.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const amoService = app.get(AmoService);

  console.log('Starting backfill...');
  try {
    const result = await amoService.runBackfill();
    console.log('Backfill completed successfully:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Backfill failed:');
    console.error(error);
  } finally {
    await app.close();
  }
}

bootstrap();
