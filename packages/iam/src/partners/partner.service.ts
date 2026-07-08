import { partnerRepository } from "@blue-pineapple/database";
import { auditService } from "../audit/audit.service";
import { eventBus } from "../events";
import type { UpdatePartnerInput } from "./partner.validators";

export class PartnerService {
  async createPartner(data: { userId: string; partnerCode: string; companyName?: string | null; commissionRate: number }): Promise<string> {
    const exists = await partnerRepository.exists(data.userId);
    if (exists) {
      throw new Error(`User ${data.userId} already has a partner profile`);
    }

    const profile = await partnerRepository.create({
      user: { connect: { id: data.userId } },
      partnerCode: data.partnerCode,
      companyName: data.companyName ?? null,
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

  async findById(id: string) {
    return partnerRepository.findWithPayoutAccounts(id);
  }

  async findByUserId(userId: string) {
    return partnerRepository.findByUserId(userId);
  }

  async findByPartnerCode(partnerCode: string) {
    return partnerRepository.findByPartnerCode(partnerCode);
  }

  async updateProfile(partnerId: string, data: UpdatePartnerInput) {
    const updated = await partnerRepository.update(partnerId, data as any);
    await auditService.logRoleAssigned(null, updated.userId, "PARTNER_UPDATED");
    return updated;
  }

  async addPayoutAccount(data: { partnerId: string; accountName: string; accountNumber: string; bankName?: string | null; mpesaNumber?: string | null; isDefault?: boolean }) {
    const account = await partnerRepository.addPayoutAccount({
      partner: { connect: { id: data.partnerId } },
      accountName: data.accountName,
      accountNumber: data.accountNumber,
      bankName: data.bankName ?? null,
      mpesaNumber: data.mpesaNumber ?? null,
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

  async removePayoutAccount(accountId: string, partnerId: string) {
    await partnerRepository.removePayoutAccount(accountId);
    eventBus.emit("payout.account.removed", { partnerId, accountId });
  }

  async listByStatus(status: string) {
    return partnerRepository.listByStatus(status as any);
  }
}

export const partnerService = new PartnerService();
