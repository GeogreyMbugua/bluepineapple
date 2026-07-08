import { prisma } from "../client";
export class CustomerPreferenceRepository {
    async findById(id) {
        return prisma.customerPreference.findUnique({ where: { id } });
    }
    async findByCustomer(customerId) {
        return prisma.customerPreference.findMany({
            where: { customerId },
        });
    }
    async findByCategory(customerId, category) {
        return prisma.customerPreference.findMany({
            where: { customerId, category },
        });
    }
    async findOneByUnique(customerId, category, key) {
        return prisma.customerPreference.findFirst({
            where: { customerId, category, key },
        });
    }
    async create(data) {
        return prisma.customerPreference.create({ data: data });
    }
    async update(id, data) {
        return prisma.customerPreference.update({ where: { id }, data });
    }
    async upsert(customerId, category, key, value, metadata) {
        const existing = await this.findOneByUnique(customerId, category, key);
        if (existing) {
            return prisma.customerPreference.update({
                where: { id: existing.id },
                data: { value, metadata },
            });
        }
        return prisma.customerPreference.create({
            data: { customerId, category, key, value, metadata },
        });
    }
    async delete(id) {
        return prisma.customerPreference.delete({ where: { id } });
    }
    async deleteByCustomer(customerId) {
        return prisma.customerPreference.deleteMany({ where: { customerId } });
    }
}
export const customerPreferenceRepository = new CustomerPreferenceRepository();
