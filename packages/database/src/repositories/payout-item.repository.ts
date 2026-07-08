import { prisma } from "../client";
import {
  Prisma,
  PayoutItem,
} from "@prisma/client";

export class PayoutItemRepository {
  async findById(id: string) {
    return prisma.payoutItem.findUnique({
      where: { id },
      include: { payout: true },
    });
  }

  async findByPayout(payoutId: string) {
    return prisma.payoutItem.findMany({
      where: { payoutId },
      orderBy: { createdAt: "asc" },
    });
  }

  async create(data: Prisma.PayoutItemCreateInput): Promise<PayoutItem> {
    return prisma.payoutItem.create({ data: data as any });
  }
}

export const payoutItemRepository = new PayoutItemRepository();
