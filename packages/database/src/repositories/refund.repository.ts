import { prisma } from "../client";
import {
  Prisma,
  Refund,
} from "@prisma/client";

export class RefundRepository {
  async findById(id: string) {
    return prisma.refund.findUnique({
      where: { id },
      include: { payment: { include: { intent: true, provider: true } } },
    });
  }

  async findByReference(reference: string) {
    return prisma.refund.findUnique({
      where: { refundReference: reference },
      include: { payment: { include: { intent: true, provider: true } } },
    });
  }

  async findByPayment(paymentId: string) {
    return prisma.refund.findMany({
      where: { paymentId },
      orderBy: { createdAt: "desc" },
      include: { payment: { include: { intent: true, provider: true } } },
    });
  }

  async findByCustomer(customerId: string) {
    return prisma.refund.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: { payment: { include: { intent: true, provider: true } } },
    });
  }

  async findByPartner(partnerId: string) {
    return prisma.refund.findMany({
      where: { partnerId },
      orderBy: { createdAt: "desc" },
      include: { payment: { include: { intent: true, provider: true } } },
    });
  }

  async create(data: Prisma.RefundCreateInput): Promise<Refund> {
    return prisma.refund.create({ data: data as any });
  }

  async update(
    id: string,
    data: Prisma.RefundUpdateInput
  ): Promise<Refund> {
    return prisma.refund.update({ where: { id }, data });
  }
}

export const refundRepository = new RefundRepository();
