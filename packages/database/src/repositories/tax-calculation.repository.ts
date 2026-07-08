import { prisma } from "../client";

export class TaxCalculationRepository {
  async findById(id: string) {
    return prisma.taxCalculation.findUnique({
      where: { id },
      include: { taxRule: true },
    });
  }

  async findByBooking(bookingId: string) {
    return prisma.taxCalculation.findMany({
      where: { bookingId },
      include: { taxRule: true },
      orderBy: { appliedAt: "desc" },
    });
  }

  async findByQuote(quoteId: string) {
    return prisma.taxCalculation.findMany({
      where: { quoteId },
      include: { taxRule: true },
      orderBy: { appliedAt: "desc" },
    });
  }

  async create(data: {
    taxRuleId: string;
    bookingId?: string;
    quoteId?: string;
    taxableAmount: number;
    taxAmount: number;
    currency?: string;
  }) {
    return prisma.taxCalculation.create({
      data: {
        taxRule: { connect: { id: data.taxRuleId } },
        bookingId: data.bookingId ?? null,
        quoteId: data.quoteId ?? null,
        taxableAmount: data.taxableAmount.toString(),
        taxAmount: data.taxAmount.toString(),
        currency: data.currency ?? "KES",
      },
    });
  }
}

export const taxCalculationRepository = new TaxCalculationRepository();
