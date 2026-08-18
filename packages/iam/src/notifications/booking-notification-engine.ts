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
      const admins = await userRepository.findAdmins();
      if (admins.length === 0) return;

      const booking = await bookingRepository.findById(event.bookingId);
      if (!booking) return;

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
        departure: booking.departure
          ? {
              departureDateTime: booking.departure.departureDateTime,
              experience: booking.departure.experience,
              vessel: null,
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

      console.log(`[BookingNotificationEngine] Admin notification sent for new booking ${event.bookingReference} to ${recipientEmails.length} admin(s)`);
    } catch (error) {
      console.error('[BookingNotificationEngine] Failed to send admin booking created notification:', error);
    }
  };
}

export const bookingNotificationEngine = new BookingNotificationEngine();
