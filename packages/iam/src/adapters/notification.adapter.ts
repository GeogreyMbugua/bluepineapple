export interface NotificationMessage {
  to: string;
  subject?: string;
  body: string;
  purpose: string;
}

export interface NotificationAdapter {
  send(message: NotificationMessage): Promise<void>;
}
