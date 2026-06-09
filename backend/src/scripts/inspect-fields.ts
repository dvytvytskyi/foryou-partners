import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AmoService } from '../amo/amo.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const amoService = app.get(AmoService);
  const configService = app.get(ConfigService);

  const domain = configService.getOrThrow<string>('AMO_DOMAIN');
  const accessToken = await (amoService as any).getAccessToken();

  console.log(`Fetching field metadata for ${domain}...`);
  try {
    const response = await fetch(`https://${domain}/api/v4/leads/custom_fields`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.ok) {
      const data = await response.json() as any;
      const fields = data._embedded?.custom_fields ?? [];
      console.log(`Found ${fields.length} fields.`);
      for (const field of fields) {
        console.log(`- ID: ${field.id}, Name: "${field.name}", Type: ${field.type}`);
        if (field.name.toLowerCase().includes('ист') || field.name.toLowerCase().includes('sour')) {
            console.log(`  >>> POTENTIAL MATCH: ${field.name}`);
            if (field.enums) {
                console.log(`  Options: ${field.enums.map((e: any) => e.value).join(', ')}`);
            }
        }
      }
    } else {
      console.error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
