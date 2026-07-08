import { prisma } from "../client";
export class GuestRepository {
    async findById(id) {
        return prisma.guest.findUnique({ where: { id } });
    }
    async findByIdentifier(identifier) {
        return prisma.guest.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier },
                    { idNumber: identifier },
                ],
            },
        });
    }
    async incrementVisit(id) {
        return prisma.guest.update({
            where: { id },
            data: {
                totalVisits: { increment: 1 },
                lastVisitAt: new Date(),
            },
        });
    }
    async create(data) {
        return prisma.guest.create({ data });
    }
    async update(id, data) {
        return prisma.guest.update({ where: { id }, data });
    }
    async list(limit = 100, offset = 0) {
        return prisma.guest.findMany({
            orderBy: { lastName: "asc" },
            take: limit,
            skip: offset,
        });
    }
    async search(query) {
        return prisma.guest.findMany({
            where: {
                OR: [
                    { firstName: { contains: query, mode: "insensitive" } },
                    { lastName: { contains: query, mode: "insensitive" } },
                    { email: { contains: query, mode: "insensitive" } },
                    { phone: { contains: query, mode: "insensitive" } },
                ],
            },
            take: 20,
        });
    }
    async findBookingHistory(guestId) {
        return prisma.booking.findMany({
            where: { guestId },
            orderBy: { createdAt: "desc" },
            take: 50,
            include: {
                departure: {
                    include: {
                        experience: true,
                        route: true,
                        vessel: true,
                    },
                },
                partner: true,
            },
        });
    }
}
export const guestRepository = new GuestRepository();
