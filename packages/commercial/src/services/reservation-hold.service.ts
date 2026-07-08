import { prisma, reservationHoldRepository } from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";
import { z } from "zod";
import type { HoldStatus } from "../domain/commercial.types";
import type {
  ReservationHoldCreatedEvent,
  ReservationHoldExpiredEvent,
  ReservationHoldConvertedEvent,
  ReservationHoldReleasedEvent,
} from "../events/commercial.events";
import { ReservationPolicy } from "../policies";

const CreateReservationHoldSchema = z.object({
  experienceId: z.string().uuid().optional().nullable(),
  departureId: z.string().uuid().optional().nullable(),
  date: z.coerce.date().optional().nullable(),
  guestCount: z.number().int().min(1),
  holdMinutes: z.number().int().min(5).max(1440).default(20),
  metadata: z.record(z.string(), z.any()).optional(),
  createdBy: z.string().uuid().optional().nullable(),
});

export class ReservationHoldService {
  async createHold(input: z.infer<typeof CreateReservationHoldSchema>, actorId?: string): Promise<any> {
    ReservationPolicy.assertCanHold(input.experienceId ?? undefined, input.departureId ?? undefined);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + (input.holdMinutes ?? 20) * 60 * 1000);

    const hold = await prisma.$transaction(async (tx) => {
      return tx.reservationHold.create({
        data: {
          experienceId: input.experienceId || undefined,
          departureId: input.departureId || undefined,
          date: input.date ?? undefined,
          guestCount: input.guestCount,
          expiresAt,
          createdBy: actorId,
          metadata: input.metadata as any,
          holdReference: `RH-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          status: "ACTIVE",
        },
      });
    });

      auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: hold.id,
      action: "RESERVATION_HOLD_CREATED",
      details: {
        guestCount: hold.guestCount,
        expiresAt: hold.expiresAt?.toISOString(),
      },
      actorId: actorId ?? undefined,
    });

    (eventBus as any).emit("reservation.hold.created", {
      holdId: hold.id,
      holdReference: hold.holdReference,
      experienceId: hold.experienceId,
      guestCount: hold.guestCount,
      expiresAt: hold.expiresAt?.toISOString(),
    } as ReservationHoldCreatedEvent);

    return hold;
  }

  async getHold(id: string) {
    const hold = await reservationHoldRepository.findByReference(id);
    if (!hold) {
      return reservationHoldRepository.findById(id);
    }
    return hold;
  }

  async convertHold(holdId: string, toType: "BOOKING" | "QUOTE", targetId: string): Promise<void> {
    const hold = await this.getHold(holdId);
    if (!hold) {
      throw new Error("Reservation hold not found");
    }

    const updateData: any = { status: "CONVERTED" };
    if (toType === "BOOKING") {
      updateData.convertedToBookingId = targetId;
    } else {
      updateData.convertedToQuoteId = targetId;
    }

    await reservationHoldRepository.update(holdId, updateData as any);

    (eventBus as any).emit("reservation.hold.converted", {
      holdId: hold.id,
      holdReference: hold.holdReference,
      bookingId: toType === "BOOKING" ? targetId : undefined,
      quoteId: toType === "QUOTE" ? targetId : undefined,
    } as ReservationHoldConvertedEvent);
  }

  async releaseHold(holdId: string, actorId?: string): Promise<void> {
    const hold = await this.getHold(holdId);
    if (!hold) {
      throw new Error("Reservation hold not found");
    }

    await reservationHoldRepository.update(holdId, { status: "RELEASED" } as any);

      auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: holdId,
      action: "RESERVATION_HOLD_RELEASED",
      details: {},
      actorId: actorId ?? undefined,
    });

    (eventBus as any).emit("reservation.hold.released", {
      holdId: hold.id,
      holdReference: hold.holdReference,
    } as ReservationHoldReleasedEvent);
  }

  async processExpiredHolds(): Promise<number> {
    const expiredHolds = await reservationHoldRepository.findExpired();

    let count = 0;
    for (const hold of expiredHolds) {
      await reservationHoldRepository.releaseExpired(hold.id);
      (eventBus as any).emit("reservation.hold.expired", {
        holdId: hold.id,
        holdReference: hold.holdReference,
      } as ReservationHoldExpiredEvent);
      count++;
    }

    return count;
  }

  async findActiveByContext(experienceId?: string, departureId?: string): Promise<any> {
    return reservationHoldRepository.findActive(experienceId, departureId);
  }
}

export const reservationHoldService = new ReservationHoldService();