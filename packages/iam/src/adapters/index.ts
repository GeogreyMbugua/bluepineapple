export type { NotificationAdapter, NotificationMessage } from "./notification.adapter";
export { ConsoleNotificationAdapter } from "./console.adapter";
export { ResendNotificationAdapter } from "./resend.adapter";

import type { NotificationAdapter } from "./notification.adapter";
import { ConsoleNotificationAdapter } from "./console.adapter";

let adapter: NotificationAdapter = new ConsoleNotificationAdapter();

export const notificationService = {
  setAdapter(a: NotificationAdapter): void {
    adapter = a;
  },

  async send(message: { to: string; subject?: string; body: string; purpose: string }): Promise<void> {
    return adapter.send(message);
  },
};
