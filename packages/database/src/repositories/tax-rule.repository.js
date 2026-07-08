import { prisma } from "../client";
export class TaxRuleRepository {
    async findById(id) {
        return prisma.taxRule.findUnique({
            where: { id },
            include: { calculations: true },
        });
    }
    async findActive(jurisdiction) {
        const now = new Date();
        return prisma.taxRule.findMany({
            where: {
                isActive: true,
                effectiveFrom: { lte: now },
                OR: [
                    { effectiveTo: null },
                    { effectiveTo: { gte: now } },
                ],
                ...(jurisdiction ? { jurisdiction: jurisdiction } : {}),
            },
            orderBy: { priority: "desc" },
        });
    }
    async findDefault(jurisdiction) {
        return prisma.taxRule.findFirst({
            where: {
                isDefault: true,
                isActive: true,
                jurisdiction: jurisdiction,
            },
            orderBy: { priority: "desc" },
        });
    }
    async create(data) {
        return prisma.taxRule.create({
            data: {
                name: data.name,
                description: data.description,
                type: data.type,
                jurisdiction: data.jurisdiction,
                rate: data.rate.toString(),
                isPercentage: data.isPercentage ?? true,
                isInclusive: data.isInclusive ?? false,
                appliesTo: data.appliesTo,
                effectiveFrom: data.effectiveFrom,
                effectiveTo: data.effectiveTo,
                priority: data.priority ?? 0,
                isDefault: data.isDefault ?? false,
            },
        });
    }
}
export const taxRuleRepository = new TaxRuleRepository();
