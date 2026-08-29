import { departureRepository } from "@blue-pineapple/database";
import { Prisma } from "@prisma/client";

export class BookingCapacityService {
  async checkAvailability(
    departureId: string,
    additionalGuests: number,
    online = true,
  ): Promise<boolean> {
    const departure = await departureRepository.findByIdWithCapacity(departureId);
    if (!departure) {
      throw new Error("Departure not found");
    }
    if (departure.status !== "SCHEDULED" && departure.status !== "BOARDING") {
      throw new Error("Departure is not open for bookings");
    }
    return online
      ? departure.onlineCapacity - departure.onlineBookedSeats >= additionalGuests &&
          departure.availableCapacity >= additionalGuests
      : departure.availableCapacity >= additionalGuests;
  }

  async getAvailableCapacity(departureId: string, online = true): Promise<number> {
    const departure = await departureRepository.findByIdWithCapacity(departureId);
    if (!departure) {
      throw new Error("Departure not found");
    }
    return online
      ? Math.min(
          departure.availableCapacity,
          departure.onlineCapacity - departure.onlineBookedSeats,
        )
      : departure.availableCapacity;
  }

  async reserveCapacity(departureId: string, guestCount: number): Promise<void> {
    const departure = await departureRepository.findByIdWithCapacity(departureId);
    if (!departure) {
      throw new Error("Departure not found");
    }
    if (departure.availableCapacity < guestCount) {
      throw new Error(
        `Insufficient capacity. Available: ${departure.availableCapacity}, requested: ${guestCount}`
      );
    }
    await departureRepository.decrementAvailableCapacity(departureId, guestCount);
  }

  async releaseCapacity(departureId: string, guestCount: number): Promise<void> {
    await departureRepository.incrementAvailableCapacity(departureId, guestCount);
  }

  async getCapacityInfo(departureId: string) {
    const departure = await departureRepository.findByIdWithCapacity(departureId);
    if (!departure) {
      throw new Error("Departure not found");
    }
    return {
      totalCapacity: departure.totalCapacity,
      bookedSeats: departure.bookedSeats,
      availableCapacity: departure.availableCapacity,
      onlineCapacity: departure.onlineCapacity,
      onlineBookedSeats: departure.onlineBookedSeats,
      onlineAvailableCapacity: Math.max(
        0,
        departure.onlineCapacity - departure.onlineBookedSeats,
      ),
    };
  }

  atomicReserve(
    tx: Prisma.TransactionClient,
    departureId: string,
    guestCount: number,
  ): Promise<void> {
    return tx.departure
      .update({
        where: {
          id: departureId,
          availableCapacity: {
            gte: guestCount,
          },
        },
        data: {
          bookedSeats: { increment: guestCount },
          availableCapacity: { decrement: guestCount },
        },
      })
      .then(() => {})
      .catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
          throw new Error(
            `Insufficient capacity: requested ${guestCount} guests for departure ${departureId}`
          );
        }
        throw error;
      });
  }

  async atomicReserveOnline(
    tx: Prisma.TransactionClient,
    departureId: string,
    guestCount: number,
  ): Promise<void> {
    const departure = await tx.departure.findUnique({
      where: { id: departureId },
      select: { onlineCapacity: true },
    });

    if (!departure) {
      throw new Error("Departure not found");
    }

    const result = await tx.departure.updateMany({
      where: {
        id: departureId,
        availableCapacity: { gte: guestCount },
        onlineBookedSeats: { lte: departure.onlineCapacity - guestCount },
      },
      data: {
        bookedSeats: { increment: guestCount },
        availableCapacity: { decrement: guestCount },
        onlineBookedSeats: { increment: guestCount },
      },
    });

    if (result.count !== 1) {
      throw new Error(
        `Insufficient online capacity: requested ${guestCount} guests for departure ${departureId}`,
      );
    }
  }

  async atomicRelease(
    tx: Prisma.TransactionClient,
    departureId: string,
    guestCount: number,
    online = false,
  ): Promise<void> {
    const result = await tx.departure.updateMany({
      where: {
        id: departureId,
        bookedSeats: { gte: guestCount },
        ...(online ? { onlineBookedSeats: { gte: guestCount } } : {}),
      },
      data: {
        bookedSeats: { decrement: guestCount },
        availableCapacity: { increment: guestCount },
        ...(online ? { onlineBookedSeats: { decrement: guestCount } } : {}),
      },
    });

    if (result.count !== 1) {
      throw new Error(`Capacity release rejected for departure ${departureId}`);
    }
  }
}

export const bookingCapacityService = new BookingCapacityService();
