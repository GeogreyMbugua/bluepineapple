import { prisma } from "../client";
import type { PartnerProfile, PartnerPayoutAccount, PartnerStatus, Prisma } from "@prisma/client";

export class PartnerRepository {
  async findById(id: string): Promise<PartnerProfile | null> {
    return prisma.partnerProfile.findUnique({ where: { id } });
  }

  async findByUserId(userId: string): Promise<PartnerProfile | null> {
    return prisma.partnerProfile.findUnique({ where: { userId } });
  }

  async findByPartnerCode(partnerCode: string): Promise<PartnerProfile | null> {
    return prisma.partnerProfile.findUnique({ where: { partnerCode } });
  }

  async findWithPayoutAccounts(partnerId: string): Promise<(PartnerProfile & { payoutAccounts: PartnerPayoutAccount[] }) | null> {
    return prisma.partnerProfile.findUnique({
      where: { id: partnerId },
      include: { payoutAccounts: true, statusHistory: { orderBy: { createdAt: "desc" }, take: 10 } },
    });
  }

  async create(data: Prisma.PartnerProfileCreateInput): Promise<PartnerProfile> {
    return prisma.partnerProfile.create({ data });
  }

  async update(id: string, data: Prisma.PartnerProfileUpdateInput): Promise<PartnerProfile> {
    return prisma.partnerProfile.update({ where: { id }, data });
  }

  async addPayoutAccount(data: Prisma.PartnerPayoutAccountCreateInput): Promise<PartnerPayoutAccount> {
    return prisma.partnerPayoutAccount.create({ data });
  }

  async removePayoutAccount(accountId: string): Promise<PartnerPayoutAccount> {
    return prisma.partnerPayoutAccount.delete({ where: { id: accountId } });
  }

  async setDefaultPayoutAccount(accountId: string, partnerId: string): Promise<void> {
    await prisma.$transaction([
      prisma.partnerPayoutAccount.updateMany({ where: { partnerId }, data: { isDefault: false } }),
      prisma.partnerPayoutAccount.update({ where: { id: accountId }, data: { isDefault: true } }),
    ]);
  }

  async listByStatus(status: PartnerStatus): Promise<PartnerProfile[]> {
    return prisma.partnerProfile.findMany({ where: { status } });
  }

  async exists(userId: string): Promise<boolean> {
    const count = await prisma.partnerProfile.count({ where: { userId } });
    return count > 0;
  }
}

export const partnerRepository = new PartnerRepository();
