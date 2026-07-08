import { prisma } from "../client";
import {
  IntentStatus,
  PaymentIntent,
  Prisma,
} from "@prisma/client";

export class PaymentIntentRepository {
  async findById(id: string) {
    return prisma.paymentIntent.findUnique({
      where: { id },
      include: {
        payments: true,
        providerResponses: true,
      },
    });
  }

  async findByReference(reference: string) {
    return prisma.paymentIntent.findUnique({
      where: { intentReference: reference },
      include: {
        payments: true,
        providerResponses: true,
      },
    });
  }

  async findByStatus(status: IntentStatus, limit = 100) {
    return prisma.paymentIntent.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { payments: true },
    });
  }

  async findByBooking(bookingId: string) {
    return prisma.paymentIntent.findMany({
      where: { bookingId },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: Prisma.PaymentIntentCreateInput): Promise<PaymentIntent> {
    return prisma.paymentIntent.create({ data: data as any });
  }

  async update(
    id: string,
    data: Prisma.PaymentIntentUpdateInput
  ): Promise<PaymentIntent> {
    return prisma.paymentIntent.update({ where: { id }, data });
  }

  async updateIfUnchanged(
    id: string,
    expectedUpdatedAt: Date,
    data: Prisma.PaymentIntentUpdateInput
  ): Promise<PaymentIntent | null> {
    try {
      return prisma.paymentIntent.update({
        where: { id, updatedAt: expectedUpdatedAt },
        data,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Record to update not found")) {
        return null;
      }
      throw error;
    }
  }
}

export const paymentIntentRepository = new PaymentIntentRepository();
