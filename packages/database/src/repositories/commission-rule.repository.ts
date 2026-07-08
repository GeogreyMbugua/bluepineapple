import { prisma } from "../client";

export class CommissionRuleRepository {
  async findById(id: string) {
    return prisma.commissionRule.findUnique({
      where: { id },
      include: { calculations: true },
    });
  }

  async findActive(type?: string) {
    const now = new Date();
    return prisma.commissionRule.findMany({
      where: {
        isActive: true,
        effectiveFrom: { lte: now },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: now } },
        ],
        ...(type ? { type: type as any } : {}),
      },
      orderBy: { priority: "desc" },
    });
  }

  async findDefault(type: string) {
    return prisma.commissionRule.findFirst({
      where: {
        isDefault: true,
        isActive: true,
        type: type as any,
      },
      orderBy: { priority: "desc" },
    });
  }

  async create(data: {
    name: string;
    description?: string;
    type: string;
    rate: number;
    isPercentage?: boolean;
    fixedAmount?: number;
    appliesTo?: any;
    effectiveFrom: Date;
    effectiveTo?: Date;
    priority?: number;
    isDefault?: boolean;
  }) {
    return prisma.commissionRule.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        type: data.type as any,
        rate: data.rate.toString(),
        isPercentage: data.isPercentage ?? true,
        fixedAmount: data.fixedAmount ?? null,
        appliesTo: data.appliesTo ?? null,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo ?? null,
        priority: data.priority ?? 0,
        isDefault: data.isDefault ?? false,
      },
    });
  }
}

export const commissionRuleRepository = new CommissionRuleRepository();
