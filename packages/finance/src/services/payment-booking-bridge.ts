import { prisma, runInTransaction } from '@blue-pineapple/database';
import { eventBus } from '@blue-pineapple/iam';
import type { PaymentCapturedEvent } from '../events';

/**
 * When a payment linked to a booking is captured for the full amount,
 * mark the booking as PAID and confirm it if still PENDING.
 *
 * Security / edge cases:
 * - Underpayment never confirms booking (confirmBooking === false or amount check).
 * - Idempotent if already PAID + CONFIRMED.
 * - Does not invent bookingId when confirmBooking is explicitly false.
 */
export class PaymentBookingBridge {
  private unsubscribe: (() => void) | null = null;

  start(): void {
    if (this.unsubscribe) return;

    this.unsubscribe = eventBus.on(
      'payment.captured',
      (event: PaymentCapturedEvent) => {
        void this.handlePaymentCaptured(event).catch((error) => {
          console.error('[payment-booking-bridge] failed to update booking', error);
        });
      },
    );
  }

  stop(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  private async handlePaymentCaptured(event: PaymentCapturedEvent): Promise<void> {
    if (event.confirmBooking === false || event.underpaid === true) {
      return;
    }

    const intent = event.intentId
      ? await prisma.paymentIntent.findUnique({
          where: { id: event.intentId },
          select: { bookingId: true, amount: true, metadata: true },
        })
      : null;

    const bookingId = event.bookingId ?? intent?.bookingId ?? undefined;
    if (!bookingId) return;

    const expectedAmount = event.expectedAmount ?? (intent ? Number(intent.amount) : undefined);
    const paidAmount = Number(event.amount);

    if (
      expectedAmount !== undefined &&
      Number.isFinite(expectedAmount) &&
      Number.isFinite(paidAmount) &&
      paidAmount + 0.009 < expectedAmount
    ) {
      console.warn('[payment-booking-bridge] skipping booking confirm: underpayment', {
        bookingId,
        paidAmount,
        expectedAmount,
        paymentId: event.paymentId,
      });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        bookingReference: true,
      },
    });

    if (!booking) return;
    if (booking.paymentStatus === 'PAID' && booking.status === 'CONFIRMED') return;

    const shouldConfirm = booking.status === 'PENDING';

    await runInTransaction(async (tx) => {
      await tx.booking.updateMany({
        where: {
          id: bookingId,
          // Avoid regressing cancelled/completed bookings to CONFIRMED.
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        data: {
          paymentStatus: 'PAID',
          ...(shouldConfirm ? { status: 'CONFIRMED' } : {}),
        },
      });

      if (shouldConfirm) {
        await tx.bookingStatusHistory.create({
          data: {
            bookingId,
            oldStatus: booking.status,
            newStatus: 'CONFIRMED',
            reason: event.mpesaReceiptNumber
              ? `M-Pesa payment ${event.mpesaReceiptNumber}`
              : 'Payment captured',
            changedByUserId: null,
          },
        });
      }
    });

    if (shouldConfirm) {
      eventBus.emit('booking.confirmed', {
        bookingId,
        bookingReference: booking.bookingReference,
      });

      eventBus.emit('booking.status.changed', {
        bookingId,
        oldStatus: booking.status,
        newStatus: 'CONFIRMED',
      });
    }
  }
}

export const paymentBookingBridge = new PaymentBookingBridge();
