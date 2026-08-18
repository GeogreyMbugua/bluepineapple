import { Resend } from 'resend';
import type { NotificationAdapter, NotificationMessage } from './notification.adapter';

export class ResendNotificationAdapter implements NotificationAdapter {
  private resend: Resend;
  private defaultFrom: string;

  constructor(apiKey: string, defaultFrom: string) {
    this.resend = new Resend(apiKey);
    this.defaultFrom = defaultFrom;
  }

  async send(message: NotificationMessage): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.defaultFrom,
      to: message.to,
      subject: message.subject ?? `Blue Pineapple ${message.purpose}`,
      html: message.body,
      tags: [
        { name: 'purpose', value: message.purpose },
      ],
    });

    if (error) {
      throw new Error(`Resend delivery failed: ${error.message}`);
    }
  }
}
