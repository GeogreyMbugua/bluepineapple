import { prisma } from "../client";
import { RefundStatus, } from "@prisma/client";
export class RefundCalculationRepository {
    async findById(id) {
        return prisma.refundCalculation.findUnique({
            where: { id },
        });
    }
    async findByReference(reference) {
        return prisma.refundCalculation.findUnique({
            where: { calculationReference: reference },
        });
    }
    async findByBooking(bookingId) {
        return prisma.refundCalculation.findMany({
            where: { bookingId },
            orderBy: { calculatedAt: "desc" },
        });
    }
    async create(data) {
        return prisma.refundCalculation.create({ data });
    }
    async update(id, data) {
        return prisma.refundCalculation.update({ where: { id }, data });
    }
    async findByStatus(status, limit = 100) {
        return prisma.refundCalculation.findMany({
            where: { status },
            orderBy: { calculatedAt: "desc" },
            take: limit,
        });
    }
    async findPending() {
        return prisma.refundCalculation.findMany({
            where: { status: RefundStatus.CALCULATED },
            orderBy: { calculatedAt: "asc" },
        });
    }
}
export const refundCalculationRepository = new RefundCalculationRepository();
