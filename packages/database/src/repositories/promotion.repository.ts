import { prisma } from "../client";
import {
  Promotion,
  PromotionStatus,
  Prisma,
} from "@prisma/client";

export class PromotionRepository {
  async findById(id: string) {
    return prisma.promotion.findUnique({
      where: { id },
      include: {
        rules: true,
        usages: true,
      },
    });
  }

  async findByCode(code: string) {
    return prisma.promotion.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        rules: true,
      },
    });
  }

  async findActive(date: Date) {
    return prisma.promotion.findMany({
      where: {
        status: PromotionStatus.ACTIVE,
        effectiveFrom: { lte: date },
        effectiveTo: { gte: date },
        maxUsageCount: { gt: 0 },
      },
      include: {
        rules: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async incrementUsage(id: string): Promise<void> {
    await prisma.promotion.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });
  }

  async create(data: Prisma.PromotionCreateInput): Promise<Promotion> {
    return prisma.promotion.create({ data });
  }

  async update(id: string, data: Prisma.PromotionUpdateInput): Promise<Promotion> {
    return prisma.promotion.update({ where: { id }, data });
  }

  async updateIfUnchanged(
    id: string,
    expectedUpdatedAt: Date,
    data: Prisma.PromotionUpdateInput
  ): Promise<Promotion | null> {
    try {
      return prisma.promotion.update({
        where: { id, updatedAt: expectedUpdatedAt },
        data,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Record to update not found")) {
        return null;
      }
      throw error;
    }
  }

  async findByStatus(status: PromotionStatus, limit = 100) {
    return prisma.promotion.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

export const promotionRepository = new PromotionRepository();
