import { prisma } from "../client";
export class CustomerInteractionRepository {
    async findById(id) {
        return prisma.customerInteraction.findUnique({
            where: { id },
            include: { customer: true },
        });
    }
    async findByCustomer(customerId, limit = 50, offset = 0) {
        return prisma.customerInteraction.findMany({
            where: { customerId },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
        });
    }
    async findByType(type, limit = 100, offset = 0) {
        return prisma.customerInteraction.findMany({
            where: { type },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
        });
    }
    async findByEntity(relatedEntityType, relatedEntityId) {
        return prisma.customerInteraction.findMany({
            where: {
                relatedEntityType,
                relatedEntityId,
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async create(data) {
        return prisma.customerInteraction.create({ data: data });
    }
    async update(id, data) {
        return prisma.customerInteraction.update({ where: { id }, data });
    }
    async delete(id) {
        return prisma.customerInteraction.delete({ where: { id } });
    }
    async deleteByCustomer(customerId) {
        return prisma.customerInteraction.deleteMany({ where: { customerId } });
    }
}
export const customerInteractionRepository = new CustomerInteractionRepository();
