import { prisma } from "../client";
export class CustomerContactRepository {
    async findById(id) {
        return prisma.customerContact.findUnique({ where: { id } });
    }
    async findByCustomer(customerId) {
        return prisma.customerContact.findMany({
            where: { customerId },
            orderBy: { isPrimary: "desc" },
        });
    }
    async findPrimary(customerId) {
        return prisma.customerContact.findFirst({
            where: { customerId, isPrimary: true },
        });
    }
    async findByType(customerId, type) {
        return prisma.customerContact.findMany({
            where: { customerId, type },
        });
    }
    async create(data) {
        return prisma.customerContact.create({ data: data });
    }
    async update(id, data) {
        return prisma.customerContact.update({ where: { id }, data });
    }
    async delete(id) {
        return prisma.customerContact.delete({ where: { id } });
    }
    async findOneByUnique(customerId, type, value) {
        return prisma.customerContact.findFirst({
            where: { customerId, type, value },
        });
    }
    async updateByUnique(customerId, type, value, data) {
        return prisma.customerContact.updateMany({
            where: { customerId, type, value },
            data,
        });
    }
}
export const customerContactRepository = new CustomerContactRepository();
