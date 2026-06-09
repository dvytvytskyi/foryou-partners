import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AmoService } from './src/amo/amo.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const amoService = app.get(AmoService);
  
  try {
    const res = await amoService.createPartnerRegistrationLead({
      firstName: 'Test',
      lastName: 'Partner',
      phone: '+1234567890',
      email: 'testpartner@example.com',
      country: 'Ukraine',
      direction: 'брокер'
    });
    console.log('Success:', res);
  } catch (err) {
    console.error('Error:', err);
  }
  
  await app.close();
}
bootstrap();
