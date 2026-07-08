import { prisma } from "../client";
export class PromotionRuleRepository {
    async findById(id) {
        return prisma.promotionRule.findUnique({
            where: { id },
            include: { promotion: true },
        });
    }
    async findByPromotion(promotionId) {
        return prisma.promotionRule.findMany({
            where: { promotionId },
            orderBy: { priority: "desc" },
        });
    }
    async create(data) {
        return prisma.promotionRule.create({
            data: {
                promotion: { connect: { id: data.promotionId } },
                ruleType: data.ruleType,
                conditions: data.conditions,
                priority: data.priority ?? 0,
                isActive: data.isActive ?? true,
            },
        });
    }
}
export const promotionRuleRepository = new PromotionRuleRepository();
