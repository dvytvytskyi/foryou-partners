import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WebhookController } from '../src/webhook/webhook.controller';
import { WebhookService } from '../src/webhook/webhook.service';

describe('WebhookController (e2e)', () => {
  let app: INestApplication;
  let baseUrl: string;
  let webhookServiceMock: { handleAmocrmWebhook: jest.Mock };

  beforeAll(async () => {
    webhookServiceMock = {
      handleAmocrmWebhook: jest.fn().mockResolvedValue({ accepted: true, duplicate: false }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [{ provide: WebhookService, useValue: webhookServiceMock }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api/v1');
    await app.listen(0);
    const address = app.getHttpServer().address();
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/webhook/amocrm forwards payload event_id', async () => {
    const payload = { event_id: 'evt-123', leads: { status: [] } };

    const response = await fetch(`${baseUrl}/api/v1/webhook/amocrm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': 'secret',
      },
      body: JSON.stringify(payload),
    });

    expect(response.status).toBe(201);
    expect(webhookServiceMock.handleAmocrmWebhook).toHaveBeenCalledWith({
      eventId: 'evt-123',
      signature: 'secret',
      payload,
    });
  });
});
