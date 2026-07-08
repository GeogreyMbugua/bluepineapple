import { partnerRepository } from "@blue-pineapple/database";
import { auditService } from "../audit/audit.service";
import { eventBus } from "../events";
export class PartnerService {
    async createPartner(data) {
        const exists = await partnerRepository.exists(data.userId);
        if (exists) {
            throw new Error(`User ${data.userId} already has a partner profile`);
        }
        const profile = await partnerRepository.create({
            user: { connect: { id: data.userId } },
            partnerCode: data.partnerCode,
            companyName: data.companyName,
            commissionRate: data.commissionRate,
            status: "ACTIVE",
        });
        await auditService.logRoleAssigned(null, data.userId, "PARTNER_CREATED");
        eventBus.emit("partner.created", {
            partnerId: profile.id,
            userId: data.userId,
            partnerCode: data.partnerCode,
        });
        return profile.id;
    }
    async findById(id) {
        return partnerRepository.findWithPayoutAccounts(id);
    }
    async findByUserId(userId) {
        return partnerRepository.findByUserId(userId);
    }
    async findByPartnerCode(partnerCode) {
        return partnerRepository.findByPartnerCode(partnerCode);
    }
    async updateProfile(partnerId, data) {
        const updated = await partnerRepository.update(partnerId, data);
        await auditService.logRoleAssigned(null, updated.userId, "PARTNER_UPDATED");
        return updated;
    }
    async addPayoutAccount(data) {
        const account = await partnerRepository.addPayoutAccount({
            partner: { connect: { id: data.partnerId } },
            accountName: data.accountName,
            accountNumber: data.accountNumber,
            bankName: data.bankName,
            mpesaNumber: data.mpesaNumber,
            isDefault: data.isDefault ?? false,
        });
        if (account.isDefault) {
            await partnerRepository.setDefaultPayoutAccount(account.id, data.partnerId);
        }
        eventBus.emit("payout.account.added", {
            partnerId: data.partnerId,
            accountId: account.id,
        });
        return account;
    }
    async removePayoutAccount(accountId, partnerId) {
        await partnerRepository.removePayoutAccount(accountId);
        eventBus.emit("payout.account.removed", { partnerId, accountId });
    }
    async listByStatus(status) {
        return partnerRepository.listByStatus(status);
    }
}
export const partnerService = new PartnerService();
