import { prisma } from "../client";
export class CustomerRelationshipRepository {
    async findById(id) {
        return prisma.customerRelationship.findUnique({
            where: { id },
            include: {
                customer: true,
                related: true,
            },
        });
    }
    async findByCustomer(customerId) {
        return prisma.customerRelationship.findMany({
            where: { customerId },
            include: { related: true },
        });
    }
    async findByRelated(relatedCustomerId) {
        return prisma.customerRelationship.findMany({
            where: { relatedCustomerId },
            include: { customer: true },
        });
    }
    async findOneByUnique(customerId, relatedCustomerId, type) {
        return prisma.customerRelationship.findFirst({
            where: { customerId, relatedCustomerId, type },
        });
    }
    async findEmergencyContacts(customerId) {
        return prisma.customerRelationship.findMany({
            where: { customerId, isEmergency: true },
            include: { related: true },
        });
    }
    async create(data) {
        return prisma.customerRelationship.create({ data: data });
    }
    async update(id, data) {
        return prisma.customerRelationship.update({ where: { id }, data });
    }
    async delete(id) {
        return prisma.customerRelationship.delete({ where: { id } });
    }
    async deleteByCustomer(customerId) {
        return prisma.customerRelationship.deleteMany({ where: { customerId } });
    }
    async deleteBetween(customerId, relatedCustomerId) {
        return prisma.customerRelationship.deleteMany({
            where: {
                OR: [
                    { customerId, relatedCustomerId },
                    { customerId: relatedCustomerId, relatedCustomerId: customerId },
                ],
            },
        });
    }
}
export const customerRelationshipRepository = new CustomerRelationshipRepository();
