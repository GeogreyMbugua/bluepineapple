import {
  prisma,
  loyaltyTierRepository,
  loyaltyAccountRepository,
  customerRepository,
  customerTimelineRepository,
} from "@blue-pineapple/database";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";
import { LoyaltyPolicy } from "../policies/crm.policies";

export class LoyaltyService {
  async createTier(input: any, actorId?: string) {
    LoyaltyPolicy.canManageTiers({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any);

    const tier = await loyaltyTierRepository.create({
      name: input.name,
      code: input.code,
      level: input.level,
      minPoints: input.minPoints,
      minSpend: input.minSpend,
      minBookings: input.minBookings,
      benefits: input.benefits,
      color: input.color,
      isActive: input.isActive,
    });

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: tier.id,
      action: "LOYALTY_TIER_CREATED",
      details: { name: tier.name, code: tier.code },
      actorId: actorId ?? undefined,
    });

    return tier;
  }

  async updateTier(id: string, input: any, actorId?: string) {
    LoyaltyPolicy.canManageTiers({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any);

    const existing = await loyaltyTierRepository.findById(id);
    if (!existing) {
      throw new Error("Loyalty tier not found");
    }

    const updated = await loyaltyTierRepository.update(id, input);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: id,
      action: "LOYALTY_TIER_UPDATED",
      details: { name: updated.name },
      actorId: actorId ?? undefined,
    });

    return updated;
  }

  async findTierById(id: string) {
    return loyaltyTierRepository.findById(id);
  }

  async findTierByCode(code: string) {
    return loyaltyTierRepository.findByCode(code);
  }

  async findAllTiers() {
    return loyaltyTierRepository.findAll();
  }

  async findActiveTiers() {
    return loyaltyTierRepository.findActive();
  }

  async deleteTier(id: string, actorId?: string) {
    LoyaltyPolicy.canManageTiers({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any);

    const tier = await loyaltyTierRepository.findById(id);
    if (!tier) {
      throw new Error("Loyalty tier not found");
    }

    await loyaltyTierRepository.delete(id);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: id,
      action: "LOYALTY_TIER_DELETED",
      details: { name: tier.name },
      actorId: actorId ?? undefined,
    });

    return { success: true };
  }

  async createAccount(input: any, actorId?: string) {
    LoyaltyPolicy.canManageTiers({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any);

    const existing = await loyaltyAccountRepository.findByCustomer(input.customerId);
    if (existing) {
      throw new Error("Loyalty account already exists for this customer");
    }

    const account = await loyaltyAccountRepository.create({
      customerId: input.customerId,
      tierId: input.tierId,
      pointsBalance: input.pointsBalance,
    } as any);

    return account;
  }

  async findByCustomer(customerId: string) {
    return loyaltyAccountRepository.findByCustomer(customerId);
  }

  async addPoints(customerId: string, points: number, cashValue: number, actorId?: string) {
    LoyaltyPolicy.canAdjustPoints({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any);

    const account = await loyaltyAccountRepository.findByCustomer(customerId);
    if (!account) {
      throw new Error("Loyalty account not found");
    }

    const oldBalance = account.pointsBalance;
    await loyaltyAccountRepository.updatePoints(customerId, points, cashValue);

    const updated = await loyaltyAccountRepository.findByCustomer(customerId);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: customerId,
      action: "LOYALTY_POINTS_ADDED",
      details: { points, cashValue, oldBalance, newBalance: updated!.pointsBalance },
      actorId: actorId ?? undefined,
    });

    return updated;
  }

  async redeemPoints(customerId: string, points: number, actorId?: string) {
    LoyaltyPolicy.canAdjustPoints({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any);

    const account = await loyaltyAccountRepository.findByCustomer(customerId);
    if (!account) {
      throw new Error("Loyalty account not found");
    }

    if (account.pointsBalance < points) {
      throw new Error("Insufficient points balance");
    }

    const oldBalance = account.pointsBalance;
    await loyaltyAccountRepository.redeemPoints(customerId, points);

    const updated = await loyaltyAccountRepository.findByCustomer(customerId);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: customerId,
      action: "LOYALTY_POINTS_REDEEMED",
      details: { points, oldBalance, newBalance: updated!.pointsBalance },
      actorId: actorId ?? undefined,
    });

    return updated;
  }

  async changeTier(customerId: string, tierId: string, actorId?: string) {
    LoyaltyPolicy.canAdjustPoints({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any);

    const account = await loyaltyAccountRepository.findByCustomer(customerId);
    if (!account) {
      throw new Error("Loyalty account not found");
    }

    const newTier = await loyaltyTierRepository.findById(tierId);
    if (!newTier) {
      throw new Error("Tier not found");
    }

    const oldTier = await loyaltyTierRepository.findById(account.tierId);

    await loyaltyAccountRepository.changeTier(customerId, tierId);

    const eventType = (newTier.level ?? 0) > (oldTier?.level ?? 0) ? "TIER_UPGRADED" : "TIER_DOWNGRADED";

    await customerTimelineRepository.create({
      customerId,
      eventType,
      description: `Loyalty tier changed to ${newTier.name}`,
      relatedEntityType: "LoyaltyTier",
      relatedEntityId: tierId,
      recordedBy: actorId,
    } as any);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: customerId,
      action: "LOYALTY_TIER_CHANGED",
      details: { oldTier: oldTier?.name, newTier: newTier.name },
      actorId: actorId ?? undefined,
    });

    return { success: true };
  }

  async recalculateTier(customerId: string, actorId?: string) {
    const account = await loyaltyAccountRepository.findByCustomer(customerId);
    if (!account) {
      throw new Error("Loyalty account not found");
    }

    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    const tiers = await loyaltyTierRepository.findActive();
    const sortedTiers = tiers.sort((a, b) => (b.level ?? 0) - (a.level ?? 0));

    let matchedTier = sortedTiers[sortedTiers.length - 1];
    for (const tier of sortedTiers) {
      const meetsPoints = account.pointsBalance >= (tier.minPoints ?? 0);
      const meetsSpend = !tier.minSpend || Number(customer.lifetimeValue) >= Number(tier.minSpend);
      const meetsBookings = !tier.minBookings || customer.totalBookings >= (tier.minBookings ?? 0);
      if (meetsPoints && meetsSpend && meetsBookings) {
        matchedTier = tier;
        break;
      }
    }

    if (matchedTier && matchedTier.id !== account.tierId) {
      return this.changeTier(customerId, matchedTier.id, actorId);
    }

    return account;
  }
}

export const loyaltyService = new LoyaltyService();
