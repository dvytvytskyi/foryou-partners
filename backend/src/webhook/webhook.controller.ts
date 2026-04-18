import { Body, Controller, Headers, Post } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('amocrm')
  async handleAmocrm(
    @Body() payload: Record<string, unknown>,
    @Headers('x-webhook-event-id') headerEventId?: string,
    @Headers('x-webhook-secret') signature?: string,
  ) {
    const payloadEventId = typeof payload?.event_id === 'string' ? payload.event_id : undefined;
    const eventId = payloadEventId || headerEventId || randomUUID();
    return this.webhookService.handleAmocrmWebhook({
      eventId,
      signature,
      payload,
    });
  }
}
