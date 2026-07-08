import { prisma } from "../client";
export class QuoteItemRepository {
    async findById(id) {
        return prisma.quoteItem.findUnique({ where: { id } });
    }
    async findByQuote(quoteId) {
        return prisma.quoteItem.findMany({
            where: { quoteId },
            orderBy: { createdAt: "asc" },
        });
    }
    async create(data) {
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
