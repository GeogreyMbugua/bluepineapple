import { departureRepository } from "@blue-pineapple/database";
import { Prisma } from "@prisma/client";

export class BookingCapacityService {
  async checkAvailability(departureId: string, additionalGuests: number): Promise<boolean> {
    const departure = await departureRepository.findByIdWithCapacity(departureId);
    if (!departure) {
      throw new Error("Departure not found");
    }
    if (departure.status !== "SCHEDULED" && departure.status !== "BOARDING") {
      throw new Error("Departure is not open for bookings");
    }
    return departure.availableCapacity >= additionalGuests;
  }

  async getAvailableCapacity(departureId: string): Promise<number> {
    const departure = await departureRepository.findByIdWithCapacity(departureId);
    if (!departure) {
      throw new Error("Departure not found");
    }
    return departure.availableCapacity;
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
    };
  }

  atomicReserve(tx: Prisma.TransactionClient, departureId: string, guestCount: number): Promise<void> {
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

  atomicRelease(tx: Prisma.TransactionClient, departureId: string, guestCount: number): Promise<void> {
    return tx.departure
      .update({
        where: { id: departureId },
        data: {
          bookedSeats: { decrement: guestCount },
          availableCapacity: { increment: guestCount },
        },
      })
      .then(() => {});
  }
}

export const bookingCapacityService = new BookingCapacityService();
