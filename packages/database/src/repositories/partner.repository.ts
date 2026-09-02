import { prisma } from "../client.ts";
import type { PartnerProfile, PartnerPayoutAccount, PartnerStatus, Prisma } from "@prisma/client";

export class PartnerRepository {
  async findById(id: string): Promise<PartnerProfile | null> {
    return prisma.partnerProfile.findUnique({ where: { id } });
  }

  async findByUserId(userId: string): Promise<(PartnerProfile & { payoutAccounts: PartnerPayoutAccount[] }) | null> {
    return prisma.partnerProfile.findUnique({
      where: { userId },
      include: { payoutAccounts: true },
    });
  }

  async findByUserIdWithUser(userId: string): Promise<(PartnerProfile & { payoutAccounts: PartnerPayoutAccount[]; user: { firstName: string | null; lastName: string | null } }) | null> {
    return prisma.partnerProfile.findUnique({
      where: { userId },
      include: { payoutAccounts: true, user: { select: { firstName: true, lastName: true } } },
    });
  }

  async findByPartnerCode(partnerCode: string): Promise<PartnerProfile | null> {
    return prisma.partnerProfile.findUnique({ where: { partnerCode } });
  }

  async findWithPayoutAccounts(partnerId: string) {
    return prisma.partnerProfile.findUnique({
      where: { id: partnerId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
            status: true,
            clerkUserId: true,
          },
        },
        payoutAccounts: true,
        statusHistory: { orderBy: { createdAt: "desc" }, take: 25 },
        _count: { select: { bookings: true, partnerRewards: true } },
      },
    });
  }

  async list(params: {
    status?: PartnerStatus;
    search?: string;
    skip?: number;
    take?: number;
  } = {}) {
    const search = params.search?.trim();
    return prisma.partnerProfile.findMany({
      where: {
        ...(params.status ? { status: params.status } : {}),
        ...(search
          ? {
              OR: [
                { partnerCode: { contains: search, mode: "insensitive" } },
                { companyName: { contains: search, mode: "insensitive" } },
                { user: { email: { contains: search, mode: "insensitive" } } },
                { user: { firstName: { contains: search, mode: "insensitive" } } },
                { user: { lastName: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
            status: true,
            clerkUserId: true,
          },
        },
        _count: { select: { bookings: true, partnerRewards: true } },
      },
      orderBy: { joinedAt: "desc" },
      ...(params.skip !== undefined ? { skip: params.skip } : {}),
      ...(params.take !== undefined ? { take: params.take } : {}),
    });
  }

  async count(params: { status?: PartnerStatus; search?: string } = {}) {
    const search = params.search?.trim();
    return prisma.partnerProfile.count({
      where: {
        ...(params.status ? { status: params.status } : {}),
        ...(search
          ? {
              OR: [
                { partnerCode: { contains: search, mode: "insensitive" } },
                { companyName: { contains: search, mode: "insensitive" } },
                { user: { email: { contains: search, mode: "insensitive" } } },
                { user: { firstName: { contains: search, mode: "insensitive" } } },
                { user: { lastName: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
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

  async removePayoutAccount(accountId: string, partnerId: string): Promise<PartnerPayoutAccount> {
    const account = await prisma.partnerPayoutAccount.findUnique({
      where: { id: accountId },
      select: { partnerId: true },
    });
    if (!account || account.partnerId !== partnerId) {
      throw new Error("Payout account not found for partner");
    }
    return prisma.partnerPayoutAccount.delete({ where: { id: accountId } });
  }

  async setDefaultPayoutAccount(accountId: string, partnerId: string): Promise<void> {
    const account = await prisma.partnerPayoutAccount.findUnique({
      where: { id: accountId },
      select: { partnerId: true },
    });
    if (!account || account.partnerId !== partnerId) {
      throw new Error("Payout account not found for partner");
    }
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
