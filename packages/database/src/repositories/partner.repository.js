import { prisma } from "../client";
export class PartnerRepository {
    async findById(id) {
        return prisma.partnerProfile.findUnique({ where: { id } });
    }
    async findByUserId(userId) {
        return prisma.partnerProfile.findUnique({ where: { userId } });
    }
    async findByPartnerCode(partnerCode) {
        return prisma.partnerProfile.findUnique({ where: { partnerCode } });
    }
    async findWithPayoutAccounts(partnerId) {
        return prisma.partnerProfile.findUnique({
            where: { id: partnerId },
            include: { payoutAccounts: true, statusHistory: { orderBy: { createdAt: "desc" }, take: 10 } },
        });
    }
    async create(data) {
        return prisma.partnerProfile.create({ data });
    }
    async update(id, data) {
        return prisma.partnerProfile.update({ where: { id }, data });
    }
    async addPayoutAccount(data) {
        return prisma.partnerPayoutAccount.create({ data });
    }
    async removePayoutAccount(accountId) {
        return prisma.partnerPayoutAccount.delete({ where: { id: accountId } });
    }
    async setDefaultPayoutAccount(accountId, partnerId) {
        await prisma.$transaction([
            prisma.partnerPayoutAccount.updateMany({ where: { partnerId }, data: { isDefault: false } }),
            prisma.partnerPayoutAccount.update({ where: { id: accountId }, data: { isDefault: true } }),
        ]);
    }
    async listByStatus(status) {
        return prisma.partnerProfile.findMany({ where: { status } });
    }
    async exists(userId) {
        const count = await prisma.partnerProfile.count({ where: { userId } });
        return count > 0;
    }
}
export const partnerRepository = new PartnerRepository();
