import { prisma } from "../client";
import {
  CommercialSummary,
  Prisma,
} from "@prisma/client";

export class CommercialSummaryRepository {
  async findById(id: string) {
    return prisma.commercialSummary.findUnique({ where: { id } });
  }

  async findByReference(reference: string) {
    return prisma.commercialSummary.findUnique({
      where: { summaryReference: reference },
    });
  }

  async findByBooking(bookingId: string) {
    return prisma.commercialSummary.findUnique({
      where: { bookingId },
    });
  }

  async findByQuote(quoteId: string) {
    return prisma.commercialSummary.findUnique({
      where: { quoteId },
    });
  }

  async create(data: Prisma.CommercialSummaryCreateInput): Promise<CommercialSummary> {
    return prisma.commercialSummary.create({ data });
  }

  async update(
    id: string,
    data: Prisma.CommercialSummaryUpdateInput
  ): Promise<CommercialSummary> {
    return prisma.commercialSummary.update({ where: { id }, data });
  }

  async updateIfUnchanged(
    id: string,
    _expectedUpdatedAt: Date,
    data: Prisma.CommercialSummaryUpdateInput
  ): Promise<CommercialSummary | null> {
    try {
      return prisma.commercialSummary.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Record to update not found")) {
        return null;
      }
      throw error;
    }
  }

  async findByStatus(status: string, limit = 100) {
    return prisma.commercialSummary.findMany({
      where: { status },
      orderBy: { generatedAt: "desc" },
      take: limit,
    });
  }
}

export const commercialSummaryRepository = new CommercialSummaryRepository();
