import { prisma } from "../client";
export class CommissionRuleRepository {
    async findById(id) {
        return prisma.commissionRule.findUnique({
            where: { id },
            include: { calculations: true },
        });
    }
    async findActive(type) {
        const now = new Date();
        return prisma.commissionRule.findMany({
            where: {
                isActive: true,
                effectiveFrom: { lte: now },
                OR: [
                    { effectiveTo: null },
                    { effectiveTo: { gte: now } },
                ],
                ...(type ? { type: type } : {}),
            },
            orderBy: { priority: "desc" },
        });
    }
    async findDefault(type) {
        return prisma.commissionRule.findFirst({
            where: {
                isDefault: true,
                isActive: true,
                type: type,
            },
            orderBy: { priority: "desc" },
        });
    }
    async create(data) {
        return prisma.commissionRule.create({
            data: {
                name: data.name,
                description: data.description,
                type: data.type,
                rate: data.rate.toString(),
                isPercentage: data.isPercentage ?? true,
                fixedAmount: data.fixedAmount?.toString(),
                appliesTo: data.appliesTo,
                effectiveFrom: data.effectiveFrom,
                effectiveTo: data.effectiveTo,
                priority: data.priority ?? 0,
                isDefault: data.isDefault ?? false,
            },
        });
    }
}
export const commissionRuleRepository = new CommissionRuleRepository();
