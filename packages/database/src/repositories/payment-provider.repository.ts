import { prisma } from "../client";
import {
  PaymentProvider,
  PaymentProviderType,
  Prisma,
} from "@prisma/client";

export class PaymentProviderRepository {
  async findById(id: string) {
    return prisma.paymentProvider.findUnique({
      where: { id },
      include: { payments: true, providerResponses: true },
    });
  }

  async findByType(type: PaymentProviderType) {
    return prisma.paymentProvider.findMany({
      where: { type },
      orderBy: { priority: "desc" },
    });
  }

  async findActive() {
    return prisma.paymentProvider.findMany({
      where: { isActive: true },
      orderBy: { priority: "desc" },
    });
  }

  async create(data: Prisma.PaymentProviderCreateInput): Promise<PaymentProvider> {
    return prisma.paymentProvider.create({ data: data as any });
  }

  async update(
    id: string,
    data: Prisma.PaymentProviderUpdateInput
  ): Promise<PaymentProvider> {
    return prisma.paymentProvider.update({ where: { id }, data });
  }
}

export const paymentProviderRepository = new PaymentProviderRepository();
