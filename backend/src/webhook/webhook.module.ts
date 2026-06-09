import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { AmoModule } from '../amo/amo.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AmoModule, NotificationsModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
