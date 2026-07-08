import type { NotificationAdapter } from "./notification.adapter";

export class ConsoleNotificationAdapter implements NotificationAdapter {
  async send(message: { to: string; subject?: string; body: string; purpose: string }): Promise<void> {
    const tag = `[NOTIFICATION:${message.purpose}]`;
    console.log(`${tag} to=${message.to} body=${message.body}`);
  }
}
