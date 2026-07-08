import { prisma } from "../client";
export class CustomerTimelineRepository {
    async findById(id) {
        return prisma.customerTimeline.findUnique({ where: { id } });
    }
    async findByCustomer(customerId, limit = 50, offset = 0) {
        return prisma.customerTimeline.findMany({
            where: { customerId },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
        });
    }
    async findByEventType(eventType, limit = 100, offset = 0) {
        return prisma.customerTimeline.findMany({
            where: { eventType },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
        });
    }
    async findByEntity(relatedEntityType, relatedEntityId) {
        return prisma.customerTimeline.findMany({
            where: {
                relatedEntityType,
                relatedEntityId,
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async create(data) {
        return prisma.customerTimeline.create({ data: data });
    }
    async createMany(events) {
        return prisma.customerTimeline.createMany({ data: events });
    }
    async delete(id) {
        return prisma.customerTimeline.delete({ where: { id } });
    }
    async deleteByCustomer(customerId) {
        return prisma.customerTimeline.deleteMany({ where: { customerId } });
    }
}
export const customerTimelineRepository = new CustomerTimelineRepository();
