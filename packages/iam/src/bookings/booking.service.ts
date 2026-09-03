import { prisma, runInTransaction } from "@blue-pineapple/database";
import {
  bookingRepository,
  departureRepository,
  partnerRepository,
} from "@blue-pineapple/database";
import { auditService } from "../audit/audit.service";
import { eventBus } from "../events";
import type { CreateBookingInput, UpdateBookingInput, CancelBookingInput } from "./booking.validators";
import type {
  BookingCreatedEvent,
  BookingCancelledEvent,
  BookingCompletedEvent,
  BookingStatusChangedEvent,
  BookingConfirmedEvent,
} from "./booking.events";
import { BookingPolicy, DeparturePolicy, PartnerPolicy } from "../policies";
import { bookingCapacityService } from "./booking-capacity.service";
import { guestService } from "./guest.service";
import type { BookingStatus } from "@prisma/client";

type BookingCreationInput = Omit<CreateBookingInput, "partnerId"> & {
  partnerId: string;
};

function toEastAfricaDate(dateTime: Date, time: string): Date {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  const hours = Number(match?.[1]);
  const minutes = Number(match?.[2]);
  if (!match || hours > 23 || minutes > 59) {
    throw new Error("A valid departure time is required");
  }

  const dateInKenya = dateTime.toLocaleDateString("en-CA", {
    timeZone: "Africa/Nairobi",
  });
  return new Date(`${dateInKenya}T${time}:00+03:00`);
}

export class BookingService {
  private generateBookingReference(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BP-${timestamp}-${random}`;
  }

  async createBooking(data: BookingCreationInput, actorId?: string): Promise<{
    id: string;
    bookingReference: string;
    reused: boolean;
    totalAmount: number;
    paymentStatus: string;
    status: string;
  }> {
    const departure = await departureRepository.findById(data.departureId);
    if (!departure) {
      throw new Error("Departure not found");
    }

    const partner = await partnerRepository.findById(data.partnerId);
    if (!partner) {
      throw new Error("Partner not found");
    }
    PartnerPolicy.assertCanBook(partner.status);

    DeparturePolicy.assertModifiable(departure.status);

    if (!BookingPolicy.isBookable(departure.status)) {
      throw new Error("Departure is not open for bookings");
    }

    if (departure.vessel && !BookingPolicy.isVesselBookable(departure.vessel.status)) {
      throw new Error("Vessel is not available for bookings");
    }

    if (departure.experience) {
      BookingPolicy.assertExperienceBookable(departure.experience.isActive);
    }

    const source = data.source ?? "PARTNER";
    const originStopId = data.originStopId ?? data.pickupStopId;
    const destinationStopId = data.destinationStopId;
    if (source === "DIRECT" && (!originStopId || !destinationStopId)) {
      throw new Error("Origin and destination are required for direct bookings");
    }
    if (originStopId || destinationStopId) {
      const routeStops = departure.route?.stops ?? [];
      const originStop = routeStops.find((stop) => stop.id === originStopId);
      const destinationStop = routeStops.find((stop) => stop.id === destinationStopId);
      if (!originStop || !destinationStop || destinationStop.sequence <= originStop.sequence) {
        throw new Error("Origin and destination must belong to the departure route");
      }
    }
    const adults = data.adults ?? data.totalGuests;
    const children = data.children ?? 0;
    const infants = data.infants ?? 0;
    if (adults + children + infants !== data.totalGuests) {
      throw new Error("Passenger composition must equal total guests");
    }
    const onlineSource = source === "DIRECT" || source === "PARTNER";

    let guestId = data.guestId;

    if (!guestId && data.guest) {
      const guestInput = {
        firstName: data.guest.firstName,
        lastName: data.guest.lastName,
        ...(data.guest.email ? { email: data.guest.email } : {}),
        ...(data.guest.phone ? { phone: data.guest.phone } : {}),
      };
      const resolved = await guestService.resolveGuest(guestInput);
      guestId = resolved.id;
    }

    if (guestId) {
      const conflict = await bookingRepository.findConflicting(data.departureId, guestId);
      if (conflict) {
        const alreadySettled =
          conflict.paymentStatus === "PAID" ||
          conflict.status === "CONFIRMED" ||
          conflict.status === "COMPLETED";

        if (alreadySettled) {
          throw new Error(
            "You already have a confirmed booking for this departure. Check your email or booking reference.",
          );
        }

        // Unpaid / incomplete booking for this departure — reuse it so Pay can
        // send another STK instead of failing with a duplicate error.
        return {
          id: conflict.id,
          bookingReference: conflict.bookingReference,
          reused: true as const,
          totalAmount: Number(conflict.totalAmount),
          paymentStatus: conflict.paymentStatus,
          status: conflict.status,
        };
      }
    }

    const bookingReference = this.generateBookingReference();

    // TODO Phase 3: Idempotency check using data.idempotencyKey
    // When an idempotencyKey is provided by the payment provider (M-Pesa / Stripe / Flutterwave),
    // check for an existing booking with that key before creating a new one.
    // This requires a dedicated idempotencyKey column on the Booking model.
    // For now, the unique bookingReference serves as a basic duplicate guard.

    const result = await runInTransaction(async (tx) => {
      if (onlineSource) {
        await bookingCapacityService.atomicReserveOnline(tx, data.departureId, data.totalGuests);
      } else {
        await bookingCapacityService.atomicReserve(tx, data.departureId, data.totalGuests);
      }

      const created = await tx.booking.create({
        data: {
          bookingReference,
          departureId: data.departureId,
          partnerId: data.partnerId,
          guestId: guestId ?? null,
          totalGuests: data.totalGuests,
          totalAmount: data.totalAmount,
          currency: "KES",
          originStopId: data.originStopId ?? data.pickupStopId ?? null,
          destinationStopId: data.destinationStopId ?? null,
          adults,
          children,
          infants,
          returnTicket: data.returnTicket ?? false,
          segments: data.segments ?? null,
          pricingMode: source === "DIRECT" ? "PUBLIC" : "PARTNER_REWARD",
          discountRate: data.discountRate ?? 0,
          discountAmount: data.discountAmount ?? 0,
          status: "PENDING",
          paymentStatus: "PENDING",
          source,
          pickupStopId: data.pickupStopId ?? null,
          specialRequests: data.specialRequests ?? null,
          notes: data.notes ?? null,
          rewardEligible: source !== "DIRECT",
        } as any,
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: created.id,
          oldStatus: null,
          newStatus: "PENDING",
          changedByUserId: actorId ?? null,
        },
      });

      await tx.notificationOutbox.create({
        data: {
          bookingId: created.id,
          purpose: "ADMIN_BOOKING_CREATED",
        },
      });

      if (data.bookingGuests && data.bookingGuests.length > 0) {
        await tx.bookingGuest.createMany({
          data: data.bookingGuests.map((bg) => ({
            bookingId: created.id,
            fullName: bg.fullName,
            idNumber: bg.idNumber ?? null,
            phoneNumber: bg.phoneNumber ?? null,
            isPrimary: bg.isPrimary ?? false,
          })),
        });
      }

      return created;
    });

    auditService.logRoleAssigned(actorId ?? "system", result.id, "BOOKING_CREATED");

    eventBus.emit("booking.created", {
      bookingId: result.id,
      bookingReference: result.bookingReference,
      departureId: data.departureId,
      partnerId: data.partnerId,
      guestId,
      totalGuests: data.totalGuests,
      status: result.status,
    } as BookingCreatedEvent);

    return {
      id: result.id,
      bookingReference: result.bookingReference,
      reused: false as const,
      totalAmount: Number(result.totalAmount),
      paymentStatus: result.paymentStatus,
      status: result.status,
    };
  }

  async cancelBooking(id: string, data: CancelBookingInput, actorId?: string): Promise<void> {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (!BookingPolicy.isCancellable(booking.status)) {
      throw new Error(`Cannot cancel booking with status ${booking.status}`);
    }

    const departure = await departureRepository.findById(booking.departureId);
    if (departure) {
      BookingPolicy.assertModifiable(booking.status, departure.status);
    }

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelledBy: actorId ?? null,
          cancellationReason: data.reason ?? null,
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: id,
          oldStatus: booking.status,
          newStatus: "CANCELLED",
          reason: data.reason ?? null,
          changedByUserId: actorId ?? null,
        },
      });

      await bookingCapacityService.atomicRelease(
        tx,
        booking.departureId,
        booking.totalGuests,
        booking.source === "DIRECT" || booking.source === "PARTNER",
      );
    });

    auditService.logRoleAssigned(actorId ?? "system", id, "BOOKING_CANCELLED");

    eventBus.emit("booking.cancelled", {
      bookingId: id,
      bookingReference: booking.bookingReference,
      departureId: booking.departureId,
      ...(data.reason ? { reason: data.reason } : {}),
    } as BookingCancelledEvent);

    eventBus.emit("booking.status.changed", {
      bookingId: id,
      oldStatus: booking.status,
      newStatus: "CANCELLED",
    } as BookingStatusChangedEvent);
  }

  async confirmBooking(
    id: string,
    actorId?: string,
    departureTime?: string,
  ): Promise<void> {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new Error("Booking not found");
    }

    const departure = await departureRepository.findById(booking.departureId);
    if (!departure) {
      throw new Error("Departure not found");
    }
    BookingPolicy.assertModifiable(booking.status, departure.status);

    BookingPolicy.assertTransition(booking.status, "CONFIRMED");
    const confirmedDepartureTime = departureTime
      ? toEastAfricaDate(departure.departureDateTime, departureTime)
      : undefined;

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: {
          status: "CONFIRMED",
          paymentStatus: "PAID",
          ...(confirmedDepartureTime && { confirmedDepartureTime }),
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: id,
          oldStatus: booking.status,
          newStatus: "CONFIRMED",
          changedByUserId: actorId ?? null,
        },
      });
    });

    auditService.logRoleAssigned(actorId ?? "system", id, "BOOKING_CONFIRMED");

    eventBus.emit("booking.confirmed", {
      bookingId: id,
      bookingReference: booking.bookingReference,
    } as BookingConfirmedEvent);

    eventBus.emit("booking.status.changed", {
      bookingId: id,
      oldStatus: booking.status,
      newStatus: "CONFIRMED",
    } as BookingStatusChangedEvent);
  }

  async completeBooking(id: string, actorId?: string): Promise<void> {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new Error("Booking not found");
    }

    const departure = await departureRepository.findById(booking.departureId);
    if (departure) {
      BookingPolicy.assertModifiable(booking.status, departure.status);
    }

    BookingPolicy.assertTransition(booking.status, "COMPLETED");

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: { status: "COMPLETED" },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: id,
          oldStatus: booking.status,
          newStatus: "COMPLETED",
          changedByUserId: actorId ?? null,
        },
      });

      if (booking.guestId) {
        await tx.guest.update({
          where: { id: booking.guestId },
          data: { totalVisits: { increment: 1 } },
        });
      }
    });

    auditService.logRoleAssigned(actorId ?? "system", id, "BOOKING_COMPLETED");

    eventBus.emit("booking.completed", {
      bookingId: id,
      bookingReference: booking.bookingReference,
      partnerId: booking.partnerId,
    } as BookingCompletedEvent);

    eventBus.emit("booking.status.changed", {
      bookingId: id,
      oldStatus: booking.status,
      newStatus: "COMPLETED",
    } as BookingStatusChangedEvent);
  }

  async markNoShow(id: string, actorId?: string): Promise<void> {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new Error("Booking not found");
    }

    const departure = await departureRepository.findById(booking.departureId);
    if (departure) {
      BookingPolicy.assertModifiable(booking.status, departure.status);
    }

    BookingPolicy.assertTransition(booking.status, "NO_SHOW");

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: { status: "NO_SHOW" },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: id,
          oldStatus: booking.status,
          newStatus: "NO_SHOW",
          changedByUserId: actorId ?? null,
        },
      });

      await bookingCapacityService.atomicRelease(
        tx,
        booking.departureId,
        booking.totalGuests,
        booking.source === "DIRECT" || booking.source === "PARTNER",
      );
    });

    auditService.logRoleAssigned(actorId ?? "system", id, "BOOKING_NO_SHOW");

    eventBus.emit("booking.status.changed", {
      bookingId: id,
      oldStatus: booking.status,
      newStatus: "NO_SHOW",
    } as BookingStatusChangedEvent);
  }

  async getBooking(id: string) {
    return bookingRepository.findById(id);
  }

  async getBookingByReference(reference: string) {
    return bookingRepository.findByReference(reference);
  }

  async updateBooking(id: string, data: UpdateBookingInput, actorId?: string): Promise<void> {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new Error("Booking not found");
    }

    const departure = await departureRepository.findById(booking.departureId);
    BookingPolicy.assertModifiable(booking.status, departure?.status ?? null);

    const updateData: { specialRequests?: string | null; notes?: string | null } = {};
    if (data.specialRequests !== undefined) updateData.specialRequests = data.specialRequests;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updated = await bookingRepository.updateIfUnchanged(id, booking.updatedAt, updateData);
    if (!updated) {
      throw new Error("Booking was modified by another administrator. Please reload and try again.");
    }

    if (data.status && data.status !== booking.status) {
      BookingPolicy.assertTransition(booking.status, data.status);
      const newStatus = data.status;

      await prisma.$transaction(async (tx) => {
        await tx.booking.update({
          where: { id },
          data: { status: newStatus },
        });

         await tx.bookingStatusHistory.create({
          data: {
            bookingId: id,
            oldStatus: booking.status,
            newStatus,
            changedByUserId: actorId ?? null,
          },
        });

        if (newStatus === "CANCELLED" || newStatus === "NO_SHOW") {
          await bookingCapacityService.atomicRelease(
            tx,
            booking.departureId,
            booking.totalGuests,
            booking.source === "DIRECT" || booking.source === "PARTNER",
          );
        }
      });
    }

    auditService.logRoleAssigned(actorId ?? "system", id, "BOOKING_UPDATED");
  }

  async searchBookings(input: { status?: BookingStatus | string; page?: number; limit?: number }) {
    const status = input.status === 'ALL' ? undefined : (input.status ?? undefined);
    return bookingRepository.findByStatus(status as BookingStatus | undefined, input.limit ?? 20);
  }

  async getOnlineBookedGuestCount(departureId: string): Promise<number> {
    return bookingRepository.countOnlineBooked(departureId);
  }

  async getDepartureBookings(departureId: string) {
    return bookingRepository.findByDeparture(departureId);
  }

  async getPartnerBookings(partnerId: string, limit = 50, offset = 0) {
    return bookingRepository.findByPartner(partnerId, limit, offset);
  }

  async getGuestBookings(guestId: string) {
    return bookingRepository.findByGuest(guestId);
  }
}

export const bookingService = new BookingService();
