import { prisma } from "../client";
export class CustomerTagRepository {
    async findById(id) {
        return prisma.customerTag.findUnique({ where: { id } });
    }
    async findByCustomer(customerId) {
        return prisma.customerTag.findMany({
            where: { customerId },
        });
    }
    async findByTag(tag, limit = 100, offset = 0) {
        return prisma.customerTag.findMany({
            where: { tag },
            take: limit,
            skip: offset,
            include: { customer: true },
        });
    }
    async findOneByUnique(customerId, tag) {
        return prisma.customerTag.findFirst({
            where: { customerId, tag },
        });
    }
    async create(data) {
        return prisma.customerTag.create({ data: data });
    }
    async update(id, data) {
        return prisma.customerTag.update({ where: { id }, data });
    }
    async delete(id) {
        return prisma.customerTag.delete({ where: { id } });
    }
    async deleteByCustomer(customerId) {
        return prisma.customerTag.deleteMany({ where: { customerId } });
    }
}
export const customerTagRepository = new CustomerTagRepository();
