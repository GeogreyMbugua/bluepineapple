import { departureRepository } from "@blue-pineapple/database";
import { Prisma } from "@prisma/client";
export class BookingCapacityService {
    async checkAvailability(departureId, additionalGuests) {
        const departure = await departureRepository.findByIdWithCapacity(departureId);
        if (!departure) {
            throw new Error("Departure not found");
        }
        if (departure.status !== "SCHEDULED" && departure.status !== "BOARDING") {
            throw new Error("Departure is not open for bookings");
        }
        return departure.availableCapacity >= additionalGuests;
    }
    async getAvailableCapacity(departureId) {
        const departure = await departureRepository.findByIdWithCapacity(departureId);
        if (!departure) {
            throw new Error("Departure not found");
        }
        return departure.availableCapacity;
    }
    async reserveCapacity(departureId, guestCount) {
        const departure = await departureRepository.findByIdWithCapacity(departureId);
        if (!departure) {
            throw new Error("Departure not found");
        }
        if (departure.availableCapacity < guestCount) {
            throw new Error(`Insufficient capacity. Available: ${departure.availableCapacity}, requested: ${guestCount}`);
        }
        await departureRepository.decrementAvailableCapacity(departureId, guestCount);
    }
    async releaseCapacity(departureId, guestCount) {
        await departureRepository.incrementAvailableCapacity(departureId, guestCount);
    }
    async getCapacityInfo(departureId) {
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
    atomicReserve(tx, departureId, guestCount) {
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
            .then(() => { })
            .catch((error) => {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
                throw new Error(`Insufficient capacity: requested ${guestCount} guests for departure ${departureId}`);
            }
            throw error;
        });
    }
    atomicRelease(tx, departureId, guestCount) {
        return tx.departure
            .update({
            where: { id: departureId },
            data: {
                bookedSeats: { decrement: guestCount },
                availableCapacity: { increment: guestCount },
            },
        })
            .then(() => { });
    }
}
export const bookingCapacityService = new BookingCapacityService();
