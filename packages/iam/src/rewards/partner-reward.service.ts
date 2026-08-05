import { prisma } from "@blue-pineapple/database";
import { auditService } from "../audit/audit.service";

export type RewardTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

type PartnerRewardStatus = "ISSUED" | "REDEEMED" | "EXPIRED";

const TIER_THRESHOLDS = [
  { tier: "PLATINUM" as RewardTier, minBookings: 50, discountPercentage: 20 },
  { tier: "GOLD" as RewardTier, minBookings: 30, discountPercentage: 15 },
  { tier: "SILVER" as RewardTier, minBookings: 15, discountPercentage: 10 },
  { tier: "BRONZE" as RewardTier, minBookings: 5, discountPercentage: 5 },
];

export class PartnerRewardService {
  getTierForBookings(bookingCount: number): { tier: RewardTier; discountPercentage: number } | null {
    for (const threshold of TIER_THRESHOLDS) {
      if (bookingCount >= threshold.minBookings) {
        return { tier: threshold.tier, discountPercentage: threshold.discountPercentage };
      }
    }
    return null;
  }

  async getPartnerYearlyBookingCount(partnerId: string, year: number): Promise<number> {
    const start = new Date(`${year}-01-01T00:00:00Z`);
    const end = new Date(`${year + 1}-01-01T00:00:00Z`);

    const result = await prisma.booking.aggregate({
      where: {
        partnerId,
        status: { in: ["CONFIRMED", "COMPLETED"] },
        createdAt: { gte: start, lt: end },
      },
      _count: { id: true },
    });

    return result._count.id;
  }

  async getPartnerRewardSummary(partnerId: string, year: number) {
    const bookingCount = await this.getPartnerYearlyBookingCount(partnerId, year);
    const tier = this.getTierForBookings(bookingCount);

    const nextTier = TIER_THRESHOLDS.find((t) => t.minBookings > bookingCount);
    const bookingsToNextTier = nextTier ? nextTier.minBookings - bookingCount : 0;

    const existingReward = await prisma.partnerReward.findFirst({
      where: { partnerId, year },
      orderBy: { issuedAt: "desc" },
    });

    return {
      partnerId,
      year,
      bookingCount,
      tier: tier?.tier ?? null,
      discountPercentage: tier?.discountPercentage ?? 0,
      isRewarded: !!existingReward,
      rewardStatus: existingReward?.status ?? null,
      voucherCode: existingReward?.voucherCode ?? null,
      bookingsToNextTier,
      nextTier: nextTier?.tier ?? null,
    };
  }

  async generateVoucher(partnerId: string, year: number, actorId?: string): Promise<{ id: string; voucherCode: string }> {
    const bookingCount = await this.getPartnerYearlyBookingCount(partnerId, year);
    const tier = this.getTierForBookings(bookingCount);

    if (!tier) {
      throw new Error(`Partner does not qualify for a reward. Need at least 5 bookings, has ${bookingCount}.`);
    }

    const existingReward = await prisma.partnerReward.findFirst({
      where: { partnerId, year },
      orderBy: { issuedAt: "desc" },
    });

    if (existingReward && existingReward.status === "ISSUED") {
      throw new Error("Reward voucher already issued for this partner and year.");
    }

    const voucherCode = `BP-${tier.tier}-${year}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const expiresAt = new Date(`${year + 1}-12-31T23:59:59Z`);

    const reward = await prisma.partnerReward.create({
      data: {
        partnerId,
        tier: tier.tier,
        year,
        discountPercentage: tier.discountPercentage,
        bookingsCount: bookingCount,
        voucherCode,
        status: "ISSUED" as PartnerRewardStatus,
        expiresAt,
      },
    });

    auditService.logRoleAssigned(actorId ?? "system", reward.id, "REWARD_VOUCHER_GENERATED");

    return { id: reward.id, voucherCode };
  }

  async getPartnerRewards(partnerId: string) {
    return prisma.partnerReward.findMany({
      where: { partnerId },
      orderBy: { issuedAt: "desc" },
    });
  }

  async getAllRewards(year?: number) {
    return prisma.partnerReward.findMany({
      where: year ? { year } : {},
      orderBy: { issuedAt: "desc" },
      include: { partner: { include: { user: true } } },
    });
  }
}

export const partnerRewardService = new PartnerRewardService();
