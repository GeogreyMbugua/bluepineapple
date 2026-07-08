import { prisma } from "../client";
import { HoldStatus, } from "@prisma/client";
export class ReservationHoldRepository {
    async findById(id) {
        return prisma.reservationHold.findUnique({ where: { id } });
    }
    async findByReference(reference) {
        return prisma.reservationHold.findUnique({
            where: { holdReference: reference },
        });
    }
    async findActive(experienceId, departureId) {
        return prisma.reservationHold.findFirst({
            where: {
                status: HoldStatus.ACTIVE,
                expiresAt: { gte: new Date() },
                ...(experienceId ? { experienceId } : {}),
                ...(departureId ? { departureId } : {}),
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async findExpired(limit = 100) {
        return prisma.reservationHold.findMany({
            where: {
                status: HoldStatus.ACTIVE,
                expiresAt: { lt: new Date() },
            },
            orderBy: { expiresAt: "asc" },
            take: limit,
        });
    }
    async create(data) {
        return prisma.reservationHold.create({ data });
    }
    async update(id, data) {
        return prisma.reservationHold.update({ where: { id }, data });
    }
    async releaseExpired(id) {
        return prisma.reservationHold.update({
            where: { id },
            data: { status: HoldStatus.EXPIRED },
        });
    }
    async findByStatus(status, limit = 100) {
        return prisma.reservationHold.findMany({
            where: { status },
            orderBy: { createdAt: "desc" },
            take: limit,
        });
    }
}
export const reservationHoldRepository = new ReservationHoldRepository();
