const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./src/app.module');
const { AmoService } = require('./src/amo/amo.service');

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const amoService = app.get(AmoService);
  console.log('Running backfill...');
  try {
    const res = await amoService.runBackfill();
    console.log('Backfill result:', res);
  } catch (err) {
    console.error('Error:', err);
  }
  await app.close();
  process.exit(0);
}
bootstrap();
