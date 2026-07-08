import { prisma } from "../client";
export class CustomerAddressRepository {
    async findById(id) {
        return prisma.customerAddress.findUnique({ where: { id } });
    }
    async findByCustomer(customerId) {
        return prisma.customerAddress.findMany({
            where: { customerId },
            orderBy: { isPrimary: "desc" },
        });
    }
    async findPrimary(customerId) {
        return prisma.customerAddress.findFirst({
            where: { customerId, isPrimary: true },
        });
    }
    async create(data) {
        return prisma.customerAddress.create({ data: data });
    }
    async update(id, data) {
        return prisma.customerAddress.update({ where: { id }, data });
    }
    async delete(id) {
        return prisma.customerAddress.delete({ where: { id } });
    }
    async deleteByCustomer(customerId) {
        return prisma.customerAddress.deleteMany({ where: { customerId } });
    }
}
export const customerAddressRepository = new CustomerAddressRepository();
