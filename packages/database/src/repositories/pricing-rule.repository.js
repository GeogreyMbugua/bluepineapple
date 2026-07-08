import { prisma } from "../client";
export class PricingRuleRepository {
    async findById(id) {
        return prisma.pricingRule.findUnique({
            where: { id },
            include: { priceList: true },
        });
    }
    async findByPriceList(priceListId, activeOnly = true) {
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
    async create(data) {
        return prisma.pricingRule.create({
            data: {
                priceListId: data.priceListId,
                name: data.name,
                description: data.description,
                ruleType: data.ruleType,
                conditions: data.conditions,
                priority: data.priority ?? 0,
                effectiveFrom: data.effectiveFrom,
                effectiveTo: data.effectiveTo,
                createdBy: data.createdBy,
            },
        });
    }
}
export const pricingRuleRepository = new PricingRuleRepository();
