import { prisma } from "../client";
import {
  Prisma,
  Payout,
  PayoutStatus,
} from "@prisma/client";

export class PayoutRepository {
  async findById(id: string) {
    return prisma.payout.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async findByReference(reference: string) {
    return prisma.payout.findUnique({
      where: { payoutReference: reference },
      include: { items: true },
    });
  }

  async findByStatus(status: PayoutStatus, limit = 100) {
    return prisma.payout.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { items: true },
    });
  }

  async findByRecipient(recipientId: string, recipientType: string) {
    return prisma.payout.findMany({
      where: { recipientId, recipientType },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
  }

  async create(data: Prisma.PayoutCreateInput): Promise<Payout> {
    return prisma.payout.create({ data: data as any });
  }

  async update(
    id: string,
    data: Prisma.PayoutUpdateInput
  ): Promise<Payout> {
    return prisma.payout.update({ where: { id }, data });
  }
}

export const payoutRepository = new PayoutRepository();
