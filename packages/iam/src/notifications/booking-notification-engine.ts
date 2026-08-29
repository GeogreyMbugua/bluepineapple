import { eventBus } from '../events';
import { notificationService } from '../adapters';
import { bookingRepository, prisma, userRepository } from '@blue-pineapple/database';
import type { BookingConfirmedEvent, BookingCreatedEvent } from '../bookings/booking.events';
import { renderBookingConfirmationEmail } from './templates/booking-confirmation.template';
import { renderAdminBookingCreatedEmail } from './templates/booking-created-admin.template';

export class BookingNotificationEngine {
  private isRunning = false;
  private unsubscribeConfirmed?: () => void;
  private unsubscribeCreated?: () => void;

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.unsubscribeConfirmed = eventBus.on('booking.confirmed', this.handleBookingConfirmed);
    this.unsubscribeCreated = eventBus.on('booking.created', this.handleBookingCreated);
    void this.processPendingAdminNotifications();
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.unsubscribeConfirmed?.();
    this.unsubscribeCreated?.();
    this.unsubscribeConfirmed = undefined;
    this.unsubscribeCreated = undefined;
  }

  private handleBookingConfirmed = async (event: BookingConfirmedEvent) => {
    try {
      const booking = await bookingRepository.findById(event.bookingId);
      if (!booking) return;

      let recipientEmail = booking.guest?.email;
      let recipientType: 'GUEST' | 'PARTNER' | undefined;

      if (!recipientEmail) {
        const partnerProfile = await prisma.partnerProfile.findFirst({
          where: { id: booking.partnerId },
          include: { user: { select: { email: true } } },
        });
        recipientEmail = partnerProfile?.user?.email ?? undefined;
        recipientType = recipientEmail ? 'PARTNER' : undefined;
      } else {
        recipientType = 'GUEST';
      }

      if (!recipientEmail) return;

      const html = renderBookingConfirmationEmail({
        bookingReference: booking.bookingReference,
        totalGuests: booking.totalGuests,
        totalAmount: String(booking.totalAmount),
        guest: booking.guest
          ? {
              firstName: booking.guest.firstName,
              lastName: booking.guest.lastName,
            }
          : null,
        departure: booking.departure
          ? {
              departureDateTime: booking.departure.departureDateTime,
              experience: booking.departure.experience,
              vessel: null,
              route: booking.departure.route,
            }
          : null,
        recipientType,
      });

      await notificationService.send({
        to: recipientEmail,
        subject: `Booking Confirmed — ${booking.bookingReference}`,
        body: html,
        purpose: 'BOOKING_CONFIRMATION',
      });

      console.log(`[BookingNotificationEngine] Confirmation sent for ${event.bookingReference}`);
    } catch (error) {
      console.error('[BookingNotificationEngine] Failed to send confirmation:', error);
    }
  };

  private handleBookingCreated = async (event: BookingCreatedEvent) => {
    try {
      await prisma.notificationOutbox.upsert({
        where: {
          bookingId_purpose: {
            bookingId: event.bookingId,
            purpose: 'ADMIN_BOOKING_CREATED',
          },
        },
        create: {
          bookingId: event.bookingId,
          purpose: 'ADMIN_BOOKING_CREATED',
        },
        update: {},
      });
      await this.deliverAdminNotification(event.bookingId);
    } catch (error) {
      console.error('[BookingNotificationEngine] Failed to enqueue admin booking notification:', error);
    }
  };

  private processPendingAdminNotifications = async () => {
    try {
      const pending = await prisma.notificationOutbox.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        take: 25,
      });
      for (const notification of pending) {
        await this.deliverAdminNotification(notification.bookingId);
      }
    } catch (error) {
      console.error('[BookingNotificationEngine] Failed to process notification outbox:', error);
    }
  };

  private deliverAdminNotification = async (bookingId: string) => {
    const claimed = await prisma.notificationOutbox.updateMany({
      where: {
        bookingId,
        purpose: 'ADMIN_BOOKING_CREATED',
        status: 'PENDING',
      },
      data: {
        status: 'PROCESSING',
        attempts: { increment: 1 },
      },
    });
    if (claimed.count === 0) return;

    try {
      const admins = await userRepository.findAdmins();
      if (admins.length === 0) {
        throw new Error('No active admin recipients configured');
      }

      const booking = await bookingRepository.findById(bookingId);
      if (!booking) throw new Error('Booking not found');

      const html = renderAdminBookingCreatedEmail({
        bookingReference: booking.bookingReference,
        totalGuests: booking.totalGuests,
        totalAmount: String(booking.totalAmount),
        guest: booking.guest
          ? {
              firstName: booking.guest.firstName,
              lastName: booking.guest.lastName,
            }
          : null,
        partnerId: booking.partnerId,
        source: booking.source,
        pricingMode: booking.pricingMode,
        adults: booking.adults,
        children: booking.children,
        infants: booking.infants,
        discountRate: Number(booking.discountRate),
        discountAmount: Number(booking.discountAmount),
        origin: booking.originStop?.name,
        destination: booking.destinationStop?.name,
        departure: booking.departure
          ? {
              departureDateTime: booking.departure.departureDateTime,
              experience: booking.departure.experience,
              vessel: booking.departure.vessel,
              route: booking.departure.route,
            }
          : null,
      });

      const recipientEmails = admins
        .map((admin) => admin.email)
        .filter((email): email is string => Boolean(email));

      for (const email of recipientEmails) {
        await notificationService.send({
          to: email,
          subject: `New Booking Created — ${booking.bookingReference}`,
          body: html,
          purpose: 'ADMIN_BOOKING_CREATED',
        });
      }

      await prisma.notificationOutbox.updateMany({
        where: { bookingId, purpose: 'ADMIN_BOOKING_CREATED', status: 'PROCESSING' },
        data: { status: 'SENT', sentAt: new Date(), lastError: null },
      });
      console.log(`[BookingNotificationEngine] Admin notification sent for new booking ${booking.bookingReference} to ${recipientEmails.length} admin(s)`);
    } catch (error) {
      await prisma.notificationOutbox.updateMany({
        where: { bookingId, purpose: 'ADMIN_BOOKING_CREATED', status: 'PROCESSING' },
        data: {
          status: 'PENDING',
          lastError: error instanceof Error ? error.message : 'Unknown notification error',
        },
      });
      console.error('[BookingNotificationEngine] Failed to send admin booking created notification:', error);
    }
  };
}

export const bookingNotificationEngine = new BookingNotificationEngine();
