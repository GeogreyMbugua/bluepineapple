import { prisma } from "../client";
import { BookingStatus, } from "@prisma/client";
export class BookingRepository {
    async findById(id) {
        return prisma.booking.findUnique({
            where: { id },
            include: {
                guest: true,
                guests: true,
                statusHistory: { orderBy: { changedAt: "desc" } },
                rewards: true,
                departure: true,
                partner: true,
                pickupStop: true,
            },
        });
    }
    async findByReference(reference) {
        return prisma.booking.findUnique({
            where: { bookingReference: reference },
            include: {
                guest: true,
                guests: true,
                statusHistory: true,
                departure: { include: { experience: true, route: true, vessel: true } },
                partner: true,
            },
        });
    }
    async findByDeparture(departureId) {
        return prisma.booking.findMany({
            where: { departureId, status: { not: BookingStatus.CANCELLED } },
            orderBy: { createdAt: "asc" },
            include: { guest: true, partner: true },
        });
    }
    async findByPartner(partnerId, limit = 50, offset = 0) {
        return prisma.booking.findMany({
            where: { partnerId },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
            include: {
                guest: true,
                departure: { include: { experience: true, route: true } },
            },
        });
    }
    async findByGuest(guestId) {
        return prisma.booking.findMany({
            where: { guestId },
            orderBy: { createdAt: "desc" },
            include: {
                departure: { include: { experience: true, route: true, vessel: true } },
                partner: true,
            },
        });
    }
    async findByStatus(status, limit = 100) {
        return prisma.booking.findMany({
            where: { status },
            orderBy: { createdAt: "desc" },
            take: limit,
            include: {
                guest: true,
                departure: { include: { experience: true, route: true } },
                partner: true,
            },
        });
    }
    async create(data) {
        return prisma.booking.create({ data });
    }
    async update(id, data) {
        return prisma.booking.update({ where: { id }, data });
    }
    async updateIfUnchanged(id, expectedUpdatedAt, data) {
        try {
            return prisma.booking.update({
                where: { id, updatedAt: expectedUpdatedAt },
                data,
            });
        }
        catch (error) {
            if (error instanceof Error && error.message.includes("Record to update not found")) {
                return null;
            }
            throw error;
        }
    }
    async findConflicting(departureId, guestId) {
        return prisma.booking.findFirst({
            where: {
                departureId,
                guestId,
                status: { not: BookingStatus.CANCELLED },
            },
        });
    }
}
export const bookingRepository = new BookingRepository();
