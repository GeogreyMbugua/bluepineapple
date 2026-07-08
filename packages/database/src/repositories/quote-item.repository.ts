import { prisma } from "../client";

export class QuoteItemRepository {
  async findById(id: string) {
    return prisma.quoteItem.findUnique({ where: { id } });
  }

  async findByQuote(quoteId: string) {
    return prisma.quoteItem.findMany({
      where: { quoteId },
      orderBy: { createdAt: "asc" },
    });
  }

  async create(data: {
    quoteId: string;
    type: string;
    description: string;
    quantity?: number;
    unitPrice: number;
    totalPrice: number;
    currency?: string;
    meta?: any;
  }) {
    return prisma.quoteItem.create({
      data: {
        quote: { connect: { id: data.quoteId } },
        type: data.type,
        description: data.description,
        quantity: data.quantity ?? 1,
        unitPrice: data.unitPrice.toString(),
        totalPrice: data.totalPrice.toString(),
        currency: data.currency ?? "KES",
        meta: data.meta,
      },
    });
  }
}

export const quoteItemRepository = new QuoteItemRepository();
