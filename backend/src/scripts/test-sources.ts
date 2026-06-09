import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AmoService } from '../amo/amo.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const amoService = app.get(AmoService);

  console.log('Testing getAvailableSources...');
  try {
    const sources = await amoService.getAvailableSources();
    console.log('Sources result:', JSON.stringify(sources, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await app.close();
  }
}

bootstrap();
