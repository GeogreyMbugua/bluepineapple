import { bookingNotificationEngine, rewardEngine, notificationService, ResendNotificationAdapter } from '@blue-pineapple/iam';
import { paymentBookingBridge } from '@blue-pineapple/finance';

let initialized = false;

export function initializeIam() {
  if (initialized) return;
  initialized = true;

  if (process.env.RESEND_API_KEY) {
    notificationService.setAdapter(
      new ResendNotificationAdapter(
        process.env.RESEND_API_KEY,
        process.env.RESEND_FROM ?? 'Blue Pineapple <bookings@bluepineappleholdings.com>'
      )
    );
  }

  rewardEngine.start();
  bookingNotificationEngine.start();
  paymentBookingBridge.start();
}
