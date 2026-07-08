import { prisma } from "../client";
import {
  RewardTransaction,
  RewardRule,
  RewardStatus,
} from "@prisma/client";

export class RewardRepository {
  async findById(id: string) {
    return prisma.rewardTransaction.findUnique({
      where: { id },
      include: {
        rule: true,
        booking: {
          include: {
            departure: { include: { experience: true, route: true } },
            partner: true,
          },
        },
        partner: true,
      },
    });
  }

  async findByBooking(bookingId: string) {
    return prisma.rewardTransaction.findUnique({
      where: { bookingId },
      include: { rule: true, partner: true },
    });
  }

  async findByPartner(partnerId: string, limit = 50, offset = 0) {
    return prisma.rewardTransaction.findMany({
      where: { partnerId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: { rule: true, booking: true },
    });
  }

  async findByStatus(status: RewardStatus, limit = 100) {
    return prisma.rewardTransaction.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { rule: true, partner: true },
    });
  }

  async findPendingRewards(limit = 100) {
    return prisma.rewardTransaction.findMany({
      where: { status: RewardStatus.PENDING },
      orderBy: { createdAt: "asc" },
      take: limit,
      include: { rule: true, partner: true },
    });
  }

  async create(data: any): Promise<RewardTransaction> {
    return prisma.rewardTransaction.create({ data });
  }

  async markPaid(id: string): Promise<RewardTransaction> {
    return prisma.rewardTransaction.update({
      where: { id },
      data: {
        status: RewardStatus.PAID_OUT,
        processedAt: new Date(),
      },
    });
  }

  async markApproved(id: string): Promise<RewardTransaction> {
    return prisma.rewardTransaction.update({
      where: { id },
      data: {
        status: RewardStatus.APPROVED,
        processedAt: new Date(),
      },
    });
  }

  async reverse(id: string, reason?: string): Promise<RewardTransaction> {
    return prisma.rewardTransaction.update({
      where: { id },
      data: {
        status: RewardStatus.REVERSED,
        processedAt: new Date(),
        metadata: { reason },
      },
    });
  }

  async findActiveRule(_partnerId: string, experienceIds?: string[], routeIds?: string[]) {
    const now = new Date();
    const rule = await prisma.rewardRule.findFirst({
      where: {
        isActive: true,
        effectiveFrom: { lte: now },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: now } },
        ],
        ...(experienceIds && experienceIds.length > 0
          ? { experienceIds: { hasSome: experienceIds } }
          : {}),
        ...(routeIds && routeIds.length > 0
          ? { routeIds: { hasSome: routeIds } }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    return rule;
  }

  async findRuleById(ruleId: string) {
    return prisma.rewardRule.findUnique({ where: { id: ruleId } });
  }

  async createRule(data: any): Promise<RewardRule> {
    return prisma.rewardRule.create({ data });
  }

  async updateRule(
    id: string,
    data: any
  ): Promise<RewardRule> {
    return prisma.rewardRule.update({ where: { id }, data });
  }

  async deactivateRule(id: string): Promise<RewardRule> {
    return prisma.rewardRule.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async listRules(activeOnly = false) {
    return prisma.rewardRule.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { createdAt: "desc" },
    });
  }
}

export const rewardRepository = new RewardRepository();
