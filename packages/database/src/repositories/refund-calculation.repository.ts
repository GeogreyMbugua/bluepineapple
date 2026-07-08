import { prisma } from "../client";
import {
  RefundCalculation,
  RefundCalculationStatus,
  Prisma,
} from "@prisma/client";

export class RefundCalculationRepository {
  async findById(id: string) {
    return prisma.refundCalculation.findUnique({
      where: { id },
    });
  }

  async findByReference(reference: string) {
    return prisma.refundCalculation.findUnique({
      where: { calculationReference: reference },
    });
  }

  async findByBooking(bookingId: string) {
    return prisma.refundCalculation.findMany({
      where: { bookingId },
      orderBy: { calculatedAt: "desc" },
    });
  }

  async create(data: Prisma.RefundCalculationCreateInput): Promise<RefundCalculation> {
    return prisma.refundCalculation.create({ data });
  }

  async update(
    id: string,
    data: Prisma.RefundCalculationUpdateInput
  ): Promise<RefundCalculation> {
    return prisma.refundCalculation.update({ where: { id }, data });
  }

  async findByStatus(status: RefundCalculationStatus, limit = 100) {
    return prisma.refundCalculation.findMany({
      where: { status },
      orderBy: { calculatedAt: "desc" },
      take: limit,
    });
  }

  async findPending() {
    return prisma.refundCalculation.findMany({
      where: { status: RefundCalculationStatus.CALCULATED },
      orderBy: { calculatedAt: "asc" },
    });
  }
}

export const refundCalculationRepository = new RefundCalculationRepository();
