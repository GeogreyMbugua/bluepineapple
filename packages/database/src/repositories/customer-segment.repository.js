import { prisma } from "../client";
export class CustomerSegmentRepository {
    async findById(id) {
        return prisma.customerSegment.findUnique({ where: { id } });
    }
    async findByCode(code) {
        return prisma.customerSegment.findUnique({ where: { code } });
    }
    async findByName(name) {
        return prisma.customerSegment.findFirst({ where: { name } });
    }
    async findAll() {
        return prisma.customerSegment.findMany({
            orderBy: { priority: "desc" },
        });
    }
    async findActive() {
        return prisma.customerSegment.findMany({
            where: { isActive: true },
            orderBy: { priority: "desc" },
        });
    }
    async create(data) {
        return prisma.customerSegment.create({ data });
    }
    async update(id, data) {
        return prisma.customerSegment.update({ where: { id }, data });
    }
    async delete(id) {
        return prisma.customerSegment.delete({ where: { id } });
    }
}
export class CustomerSegmentAssignmentRepository {
    async findById(id) {
        return prisma.customerSegmentAssignment.findUnique({
            where: { id },
            include: { segment: true, customer: true },
        });
    }
    async findByCustomer(customerId) {
        return prisma.customerSegmentAssignment.findMany({
            where: { customerId },
            include: { segment: true },
        });
    }
    async findBySegment(segmentId, limit = 100, offset = 0) {
        return prisma.customerSegmentAssignment.findMany({
            where: { segmentId },
            take: limit,
            skip: offset,
            include: { customer: true },
        });
    }
    async findOneByUnique(customerId, segmentId) {
        return prisma.customerSegmentAssignment.findFirst({
            where: { customerId, segmentId },
        });
    }
    async exists(customerId, segmentId) {
        const result = await prisma.customerSegmentAssignment.findFirst({
            where: {
                customerId,
                segmentId,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
            },
        });
        return result !== null;
    }
    async create(data) {
        return prisma.customerSegmentAssignment.create({ data: data });
    }
    async update(id, data) {
        return prisma.customerSegmentAssignment.update({ where: { id }, data });
    }
    async delete(id) {
        return prisma.customerSegmentAssignment.delete({ where: { id } });
    }
    async deleteByCustomer(customerId) {
        return prisma.customerSegmentAssignment.deleteMany({ where: { customerId } });
    }
    async deleteExpired() {
        return prisma.customerSegmentAssignment.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
            },
        });
    }
}
export const customerSegmentRepository = new CustomerSegmentRepository();
export const customerSegmentAssignmentRepository = new CustomerSegmentAssignmentRepository();
