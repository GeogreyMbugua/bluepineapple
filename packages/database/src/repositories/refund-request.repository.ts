import { prisma } from "../client";
import {
  Prisma,
  RefundRequest,
} from "@prisma/client";

export class RefundRequestRepository {
  async findById(id: string) {
    return prisma.refundRequest.findUnique({ where: { id } });
  }

  async findByReference(reference: string) {
    return prisma.refundRequest.findUnique({
      where: { requestReference: reference },
    });
  }

  async findByPayment(paymentId: string) {
    return prisma.refundRequest.findMany({
      where: { paymentIntentId: paymentId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByStatus(status: string, limit = 100) {
    return prisma.refundRequest.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async create(data: Prisma.RefundRequestCreateInput): Promise<RefundRequest> {
    return prisma.refundRequest.create({ data: data as any });
  }

  async update(
    id: string,
    data: Prisma.RefundRequestUpdateInput
  ): Promise<RefundRequest> {
    return prisma.refundRequest.update({ where: { id }, data });
  }
}

export const refundRequestRepository = new RefundRequestRepository();
