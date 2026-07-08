import { prisma } from "../client";
import {
  PaymentProviderResponse,
  Prisma,
} from "@prisma/client";

export class PaymentProviderResponseRepository {
  async findById(id: string) {
    return prisma.paymentProviderResponse.findUnique({
      where: { id },
      include: { provider: true, paymentIntent: true, payment: true },
    });
  }

  async findByPaymentIntentId(paymentIntentId: string) {
    return prisma.paymentProviderResponse.findMany({
      where: { paymentIntentId },
      orderBy: { createdAt: "desc" },
      include: { provider: true },
    });
  }

  async findByPaymentId(paymentId: string) {
    return prisma.paymentProviderResponse.findMany({
      where: { paymentId },
      orderBy: { createdAt: "desc" },
      include: { provider: true, paymentIntent: true },
    });
  }

  async create(data: Prisma.PaymentProviderResponseCreateInput): Promise<PaymentProviderResponse> {
    return prisma.paymentProviderResponse.create({ data: data as any });
  }
}

export const paymentProviderResponseRepository = new PaymentProviderResponseRepository();
