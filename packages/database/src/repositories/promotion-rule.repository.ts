import { prisma } from "../client";

export class PromotionRuleRepository {
  async findById(id: string) {
    return prisma.promotionRule.findUnique({
      where: { id },
      include: { promotion: true },
    });
  }

  async findByPromotion(promotionId: string) {
    return prisma.promotionRule.findMany({
      where: { promotionId },
      orderBy: { priority: "desc" },
    });
  }

  async create(data: {
    promotionId: string;
    ruleType: string;
    conditions: any;
    priority?: number;
    isActive?: boolean;
  }) {
    return prisma.promotionRule.create({
      data: {
        promotion: { connect: { id: data.promotionId } },
        ruleType: data.ruleType as any,
        conditions: data.conditions,
        priority: data.priority ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  }
}

export const promotionRuleRepository = new PromotionRuleRepository();
