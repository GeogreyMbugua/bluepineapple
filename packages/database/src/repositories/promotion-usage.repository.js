import { prisma } from "../client";
export class PromotionUsageRepository {
    async findById(id) {
        return prisma.promotionUsage.findUnique({ where: { id } });
    }
    async findByPromotion(promotionId, limit = 100) {
        return prisma.promotionUsage.findMany({
            where: { promotionId },
            orderBy: { usedAt: "desc" },
            take: limit,
        });
    }
    async findByUser(userId, promotionId, limit = 10) {
        return prisma.promotionUsage.findMany({
            where: { userId, promotionId },
            orderBy: { usedAt: "desc" },
            take: limit,
        });
    }
    async countByPromotion(promotionId) {
        return prisma.promotionUsage.count({
            where: { promotionId },
        });
    }
    async countByUserAndPromotion(userId, promotionId) {
        return prisma.promotionUsage.count({
            where: { userId, promotionId },
        });
    }
    async create(data) {
        return prisma.promotionUsage.create({
            data: {
                promotion: { connect: { id: data.promotionId } },
                bookingId: data.bookingId,
                userId: data.userId,
                guestId: data.guestId,
                partnerId: data.partnerId,
                discountApplied: data.discountApplied.toString(),
                currency: data.currency ?? "KES",
            },
        });
    }
}
export const promotionUsageRepository = new PromotionUsageRepository();
