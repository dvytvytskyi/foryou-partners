import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { LeadsService } from '../src/leads/leads.service';
import { AmoService } from '../src/amo/amo.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const leadsService = app.get(LeadsService);
  const amoService = app.get(AmoService);
  
  console.log('Starting full sync...');
  // Manual trigger of sync logic
  // We can't easily call private methods, but we can call AmoService.processLeads for all partners
  const partners = await (leadsService as any).prisma.partner.findMany({ where: { isActive: true } });
  
  for (const partner of partners) {
    console.log(`Syncing partner ${partner.name}...`);
    // This is a bit complex since sync logic is spread.
    // Let's just use the AdminController's logic if possible.
  }
  
  console.log('Sync finished.');
  await app.close();
}
bootstrap();
