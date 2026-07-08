import { prisma } from "../client";
export class CommissionCalculationRepository {
    async findById(id) {
        return prisma.commissionCalculation.findUnique({
            where: { id },
            include: { commissionRule: true },
        });
    }
    async findByPartner(partnerId, limit = 100) {
        return prisma.commissionCalculation.findMany({
            where: { partnerId },
            orderBy: { calculatedAt: "desc" },
            take: limit,
            include: { commissionRule: true },
        });
    }
    async findByBooking(bookingId) {
        return prisma.commissionCalculation.findMany({
            where: { bookingId },
            include: { commissionRule: true },
            orderBy: { calculatedAt: "desc" },
        });
    }
    async create(data) {
        return prisma.commissionCalculation.create({
            data: {
                commissionRule: { connect: { id: data.commissionRuleId } },
                bookingId: data.bookingId,
                partnerId: data.partnerId,
                baseAmount: data.baseAmount.toString(),
                commissionAmount: data.commissionAmount.toString(),
                currency: data.currency ?? "KES",
                status: data.status ?? "CALCULATED",
            },
        });
    }
}
export const commissionCalculationRepository = new CommissionCalculationRepository();
