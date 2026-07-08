import { prisma } from "../client";
import type {
  LoyaltyTier,
  Prisma,
  LoyaltyAccount,
} from "@prisma/client";

export class LoyaltyTierRepository {
  async findById(id: string) {
    return prisma.loyaltyTier.findUnique({ where: { id } });
  }

  async findByCode(code: string) {
    return prisma.loyaltyTier.findUnique({ where: { code } });
  }

  async findAll() {
    return prisma.loyaltyTier.findMany({
      orderBy: { level: "asc" },
    });
  }

  async findActive() {
    return prisma.loyaltyTier.findMany({
      where: { isActive: true },
      orderBy: { level: "asc" },
    });
  }

  async create(data: Prisma.LoyaltyTierCreateInput): Promise<LoyaltyTier> {
    return prisma.loyaltyTier.create({ data });
  }

  async update(
    id: string,
    data: Prisma.LoyaltyTierUpdateInput
  ): Promise<LoyaltyTier> {
    return prisma.loyaltyTier.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.loyaltyTier.delete({ where: { id } });
  }
}

export class LoyaltyAccountRepository {
  async findById(id: string) {
    return prisma.loyaltyAccount.findUnique({
      where: { id },
      include: { customer: true, tier: true },
    });
  }

  async findByCustomer(customerId: string) {
    return prisma.loyaltyAccount.findUnique({
      where: { customerId },
      include: { tier: true },
    });
  }

  async findByTier(tierId: string, limit = 100, offset = 0) {
    return prisma.loyaltyAccount.findMany({
      where: { tierId },
      take: limit,
      skip: offset,
      include: { customer: true, tier: true },
    });
  }

  async create(data: Prisma.LoyaltyAccountCreateInput): Promise<LoyaltyAccount> {
    return prisma.loyaltyAccount.create({ data });
  }

  async update(
    id: string,
    data: Prisma.LoyaltyAccountUpdateInput
  ): Promise<LoyaltyAccount> {
    return prisma.loyaltyAccount.update({ where: { id }, data });
  }

  async updatePoints(customerId: string, pointsEarned: number, cashValue: number) {
    return prisma.loyaltyAccount.update({
      where: { customerId },
      data: {
        pointsBalance: { increment: pointsEarned },
        totalPointsEarned: { increment: pointsEarned },
        lifetimeEarnings: { increment: cashValue },
        currentValue: { increment: cashValue },
      },
    });
  }

  async redeemPoints(customerId: string, pointsToRedeem: number) {
    return prisma.loyaltyAccount.update({
      where: { customerId },
      data: {
        pointsBalance: { decrement: pointsToRedeem },
        totalPointsRedeemed: { increment: pointsToRedeem },
      },
    });
  }

  async changeTier(customerId: string, tierId: string) {
    return prisma.loyaltyAccount.update({
      where: { customerId },
      data: {
        tierId,
        tierUpgradedAt: new Date(),
      },
    });
  }
}

export const loyaltyTierRepository = new LoyaltyTierRepository();
export const loyaltyAccountRepository = new LoyaltyAccountRepository();
