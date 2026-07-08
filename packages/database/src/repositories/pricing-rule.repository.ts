import { prisma } from "../client";

export class PricingRuleRepository {
  async findById(id: string) {
    return prisma.pricingRule.findUnique({
      where: { id },
      include: { priceList: true },
    });
  }

  async findByPriceList(priceListId: string, activeOnly = true) {
    return prisma.pricingRule.findMany({
      where: {
        priceListId,
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
  }

  async findActiveGlobal(activeOnly = true) {
    const now = new Date();
    return prisma.pricingRule.findMany({
      where: {
        priceListId: null,
        isActive: true,
        effectiveFrom: { lte: now },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: now } },
        ],
        ...(activeOnly ? {} : {}),
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
  }

  async create(data: {
    priceListId?: string;
    name: string;
    description?: string;
    ruleType: string;
    conditions: any;
    priority?: number;
    effectiveFrom: Date;
    effectiveTo?: Date;
    createdBy?: string;
  }) {
    return prisma.pricingRule.create({
      data: {
        priceListId: data.priceListId ?? null,
        name: data.name,
        description: data.description ?? null,
        ruleType: data.ruleType as any,
        conditions: data.conditions,
        priority: data.priority ?? 0,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo ?? null,
        createdBy: data.createdBy ?? null,
      },
    });
  }
}

export const pricingRuleRepository = new PricingRuleRepository();
