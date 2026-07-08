import { prisma } from "../client";

export class PromotionUsageRepository {
  async findById(id: string) {
    return prisma.promotionUsage.findUnique({ where: { id } });
  }

  async findByPromotion(promotionId: string, limit = 100) {
    return prisma.promotionUsage.findMany({
      where: { promotionId },
      orderBy: { usedAt: "desc" },
      take: limit,
    });
  }

  async findByUser(userId: string, promotionId: string, limit = 10) {
    return prisma.promotionUsage.findMany({
      where: { userId, promotionId },
      orderBy: { usedAt: "desc" },
      take: limit,
    });
  }

  async countByPromotion(promotionId: string): Promise<number> {
    return prisma.promotionUsage.count({
      where: { promotionId },
    });
  }

  async countByUserAndPromotion(userId: string, promotionId: string): Promise<number> {
    return prisma.promotionUsage.count({
      where: { userId, promotionId },
    });
  }

  async create(data: {
    promotionId: string;
    bookingId?: string;
    userId?: string;
    guestId?: string;
    partnerId?: string;
    discountApplied: number;
    currency?: string;
  }) {
    return prisma.promotionUsage.create({
      data: {
        promotion: { connect: { id: data.promotionId } },
        bookingId: data.bookingId ?? null,
        userId: data.userId ?? null,
        guestId: data.guestId ?? null,
        partnerId: data.partnerId ?? null,
        discountApplied: data.discountApplied.toString(),
        currency: data.currency ?? "KES",
      },
    });
  }
}

export const promotionUsageRepository = new PromotionUsageRepository();
