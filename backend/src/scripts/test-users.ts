import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AmoService } from '../amo/amo.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const amoService = app.get(AmoService);

  console.log('Fetching users...');
  try {
    const usersMap = await amoService.getCachedUsersMap();
    console.log(`Fetched ${usersMap.size} users:`);
    for (const [id, user] of usersMap.entries()) {
      console.log(`- ${id}: ${user.name} (${user.email})`);
    }
  } catch (error) {
    console.error('Failed to fetch users:');
    console.error(error);
  } finally {
    await app.close();
  }
}

bootstrap();
