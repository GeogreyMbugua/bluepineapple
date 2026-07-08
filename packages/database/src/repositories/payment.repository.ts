import { prisma } from "../client";
import {
  Payment,
  Prisma,
} from "@prisma/client";

export class PaymentRepository {
  async findById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        intent: true,
        provider: true,
        refunds: true,
        providerResponses: true,
      },
    });
  }

  async findByReference(reference: string) {
    return prisma.payment.findUnique({
      where: { paymentReference: reference },
      include: { intent: true, provider: true, refunds: true },
    });
  }

  async findByIntent(intentId: string) {
    return prisma.payment.findMany({
      where: { intentId },
      orderBy: { createdAt: "asc" },
      include: { provider: true, refunds: true },
    });
  }

  async create(data: Prisma.PaymentCreateInput): Promise<Payment> {
    return prisma.payment.create({ data: data as any });
  }

  async update(
    id: string,
    data: Prisma.PaymentUpdateInput
  ): Promise<Payment> {
    return prisma.payment.update({ where: { id }, data });
  }
}

export const paymentRepository = new PaymentRepository();
