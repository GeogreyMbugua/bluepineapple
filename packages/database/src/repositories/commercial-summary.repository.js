import { prisma } from "../client";
export class CommercialSummaryRepository {
    async findById(id) {
        return prisma.commercialSummary.findUnique({ where: { id } });
    }
    async findByReference(reference) {
        return prisma.commercialSummary.findUnique({
            where: { summaryReference: reference },
        });
    }
    async findByBooking(bookingId) {
        return prisma.commercialSummary.findUnique({
            where: { bookingId },
        });
    }
    async findByQuote(quoteId) {
        return prisma.commercialSummary.findUnique({
            where: { quoteId },
        });
    }
    async create(data) {
        return prisma.commercialSummary.create({ data });
    }
    async update(id, data) {
        return prisma.commercialSummary.update({ where: { id }, data });
    }
    async updateIfUnchanged(id, expectedUpdatedAt, data) {
        try {
            return prisma.commercialSummary.update({
                where: { id },
                data,
            });
        }
        catch (error) {
            if (error instanceof Error && error.message.includes("Record to update not found")) {
                return null;
            }
            throw error;
        }
    }
    async findByStatus(status, limit = 100) {
        return prisma.commercialSummary.findMany({
            where: { status },
            orderBy: { generatedAt: "desc" },
            take: limit,
        });
    }
}
export const commercialSummaryRepository = new CommercialSummaryRepository();
