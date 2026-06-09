import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { SupportService } from './src/support/support.service';
import { PrismaClient } from '@prisma/client';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const supportService = app.get(SupportService);
  const prisma = new PrismaClient();

  try {
    const user = await prisma.user.findFirst({ where: { role: 'partner_user' } });
    if (!user) throw new Error("No user found");
    
    console.log('Testing with user:', user.id, 'partner:', user.partnerId);
    
    const result = await supportService.createTicket(user.id, user.partnerId, {
      subject: 'Test Subject',
      message: 'Test Message'
    });
    console.log('Success:', result);
  } catch (err) {
    console.error('Error:', err);
  }

  await prisma.$disconnect();
  await app.close();
}
bootstrap();
