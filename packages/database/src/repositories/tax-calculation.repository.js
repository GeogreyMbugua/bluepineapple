import { prisma } from "../client";
export class TaxCalculationRepository {
    async findById(id) {
        return prisma.taxCalculation.findUnique({
            where: { id },
            include: { taxRule: true },
        });
    }
    async findByBooking(bookingId) {
        return prisma.taxCalculation.findMany({
            where: { bookingId },
            include: { taxRule: true },
            orderBy: { appliedAt: "desc" },
        });
    }
    async findByQuote(quoteId) {
        return prisma.taxCalculation.findMany({
            where: { quoteId },
            include: { taxRule: true },
            orderBy: { appliedAt: "desc" },
        });
    }
    async create(data) {
        return prisma.taxCalculation.create({
            data: {
                taxRule: { connect: { id: data.taxRuleId } },
                bookingId: data.bookingId,
                quoteId: data.quoteId,
                taxableAmount: data.taxableAmount.toString(),
                taxAmount: data.taxAmount.toString(),
                currency: data.currency ?? "KES",
            },
        });
    }
}
export const taxCalculationRepository = new TaxCalculationRepository();
