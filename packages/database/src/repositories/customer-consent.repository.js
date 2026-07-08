import { prisma } from "../client";
export class CustomerConsentRepository {
    async findById(id) {
        return prisma.customerConsent.findUnique({ where: { id } });
    }
    async findByCustomer(customerId) {
        return prisma.customerConsent.findMany({
            where: { customerId },
        });
    }
    async findOneByUnique(customerId, channel, consentType) {
        return prisma.customerConsent.findFirst({
            where: { customerId, channel, consentType },
        });
    }
    async isGranted(customerId, channel, consentType) {
        const consent = await prisma.customerConsent.findFirst({
            where: { customerId, channel, consentType, isGranted: true },
        });
        return consent !== null;
    }
    async create(data) {
        return prisma.customerConsent.create({ data: data });
    }
    async update(id, data) {
        return prisma.customerConsent.update({ where: { id }, data });
    }
    async upsert(customerId, channel, consentType, data) {
        const existing = await this.findOneByUnique(customerId, channel, consentType);
        if (existing) {
            return prisma.customerConsent.update({
                where: { id: existing.id },
                data,
            });
        }
        return prisma.customerConsent.create({
            data: { customerId, channel, consentType, ...data },
        });
    }
    async delete(id) {
        return prisma.customerConsent.delete({ where: { id } });
    }
    async deleteByCustomer(customerId) {
        return prisma.customerConsent.deleteMany({ where: { customerId } });
    }
}
export const customerConsentRepository = new CustomerConsentRepository();
