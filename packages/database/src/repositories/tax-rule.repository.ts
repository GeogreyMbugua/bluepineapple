import { prisma } from "../client";

export class TaxRuleRepository {
  async findById(id: string) {
    return prisma.taxRule.findUnique({
      where: { id },
      include: { calculations: true },
    });
  }

  async findActive(jurisdiction?: string) {
    const now = new Date();
    return prisma.taxRule.findMany({
      where: {
        isActive: true,
        effectiveFrom: { lte: now },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: now } },
        ],
        ...(jurisdiction ? { jurisdiction: jurisdiction as any } : {}),
      },
      orderBy: { priority: "desc" },
    });
  }

  async findDefault(jurisdiction: string) {
    return prisma.taxRule.findFirst({
      where: {
        isDefault: true,
        isActive: true,
        jurisdiction: jurisdiction as any,
      },
      orderBy: { priority: "desc" },
    });
  }

  async create(data: {
    name: string;
    description?: string;
    type: string;
    jurisdiction: string;
    rate: number;
    isPercentage?: boolean;
    isInclusive?: boolean;
    appliesTo?: any;
    effectiveFrom: Date;
    effectiveTo?: Date;
    priority?: number;
    isDefault?: boolean;
  }) {
    return prisma.taxRule.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        type: data.type as any,
        jurisdiction: data.jurisdiction as any,
        rate: data.rate.toString(),
        isPercentage: data.isPercentage ?? true,
        isInclusive: data.isInclusive ?? false,
        appliesTo: data.appliesTo ?? null,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo ?? null,
        priority: data.priority ?? 0,
        isDefault: data.isDefault ?? false,
      },
    });
  }
}

export const taxRuleRepository = new TaxRuleRepository();
