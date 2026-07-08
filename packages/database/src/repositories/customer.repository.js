import { prisma } from "../client";
export class CustomerRepository {
    async findById(id) {
        return prisma.customer.findUnique({
            where: { id },
            include: {
                contacts: true,
                addresses: true,
                preferences: true,
                segmentAssignments: { include: { segment: true } },
                tags: true,
                loyaltyAccount: { include: { tier: true } },
            },
        });
    }
    async findByCustomerNumber(customerNumber) {
        return prisma.customer.findUnique({
            where: { customerNumber },
        });
    }
    async findByEmail(email) {
        return prisma.customer.findFirst({
            where: { email },
        });
    }
    async findByPhone(phone) {
        return prisma.customer.findFirst({
            where: { phone },
        });
    }
    async findByIdentifier(identifier) {
        return prisma.customer.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier },
                    { customerNumber: identifier },
                    { idNumber: identifier },
                ],
            },
        });
    }
    async create(data) {
        return prisma.customer.create({ data });
    }
    async update(id, data) {
        return prisma.customer.update({ where: { id }, data });
    }
    async updateIfUnchanged(id, expectedUpdatedAt, data) {
        try {
            return prisma.customer.update({
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
    async delete(id) {
        return prisma.customer.delete({ where: { id } });
    }
    async list(limit = 100, offset = 0, status) {
        return prisma.customer.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
            include: {
                loyaltyAccount: { include: { tier: true } },
            },
        });
    }
    async search(query, limit = 20) {
        return prisma.customer.findMany({
            where: {
                OR: [
                    { firstName: { contains: query, mode: "insensitive" } },
                    { lastName: { contains: query, mode: "insensitive" } },
                    { email: { contains: query, mode: "insensitive" } },
                    { phone: { contains: query, mode: "insensitive" } },
                    { customerNumber: { contains: query, mode: "insensitive" } },
                ],
            },
            take: limit,
            include: {
                loyaltyAccount: { include: { tier: true } },
            },
        });
    }
    async findTopCustomers(limit = 50) {
        return prisma.customer.findMany({
            where: { status: "ACTIVE" },
            orderBy: { lifetimeValue: "desc" },
            take: limit,
        });
    }
    async findBySegment(segmentId, limit = 100, offset = 0) {
        return prisma.customer.findMany({
            where: {
                segmentAssignments: {
                    some: { segmentId },
                },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
            include: {
                loyaltyAccount: { include: { tier: true } },
            },
        });
    }
    async incrementVisit(id) {
        return prisma.customer.update({
            where: { id },
            data: {
                lastVisitAt: new Date(),
            },
        });
    }
    async updateLifetimeValue(id, amount) {
        return prisma.customer.update({
            where: { id },
            data: {
                lifetimeValue: { increment: amount },
                totalSpend: { increment: amount },
            },
        });
    }
    async incrementBookingCount(id) {
        return prisma.customer.update({
            where: { id },
            data: {
                totalBookings: { increment: 1 },
            },
        });
    }
    async updateIntelligence(id, data) {
        return prisma.customer.update({
            where: { id },
            data,
        });
    }
    async count(status) {
        return prisma.customer.count({
            where: status ? { status } : undefined,
        });
    }
}
export const customerRepository = new CustomerRepository();
