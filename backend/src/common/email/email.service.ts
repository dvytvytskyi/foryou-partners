import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  async send(options: SendEmailOptions): Promise<void> {
    const apiKey = this.configService.get<string>('EMAIL_API_KEY');
    if (!apiKey) {
      this.logger.warn(`Email skipped (EMAIL_API_KEY not set): ${options.subject} → ${options.to}`);
      return;
    }
    const provider = this.configService.get<string>('EMAIL_PROVIDER', 'sendgrid');
    if (provider === 'postmark') {
      await this.sendViaPostmark(options);
    } else {
      await this.sendViaSendGrid(options);
    }
  }

  private async sendViaSendGrid(options: SendEmailOptions): Promise<void> {
    const apiKey = this.configService.get<string>('EMAIL_API_KEY')!;
    const from = this.configService.get<string>('EMAIL_FROM')!;

    const body = JSON.stringify({
      personalizations: [{ to: [{ email: options.to }] }],
      from: { email: from },
      subject: options.subject,
      content: [
        ...(options.text ? [{ type: 'text/plain', value: options.text }] : []),
        { type: 'text/html', value: options.html },
      ],
    });

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      this.logger.error(`SendGrid error ${response.status}: ${text}`);
      throw new Error(`Email delivery failed (SendGrid ${response.status})`);
    }
  }

  private async sendViaPostmark(options: SendEmailOptions): Promise<void> {
    const apiKey = this.configService.get<string>('EMAIL_API_KEY')!;
    const from = this.configService.get<string>('EMAIL_FROM')!;

    const body = JSON.stringify({
      From: from,
      To: options.to,
      Subject: options.subject,
      HtmlBody: options.html,
      TextBody: options.text ?? '',
      MessageStream: 'outbound',
    });

    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'X-Postmark-Server-Token': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      this.logger.error(`Postmark error ${response.status}: ${text}`);
      throw new Error(`Email delivery failed (Postmark ${response.status})`);
    }
  }
}
