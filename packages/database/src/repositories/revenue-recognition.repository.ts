import { prisma } from "../client";
import {
  Prisma,
  RevenueRecognition,
} from "@prisma/client";

export class RevenueRecognitionRepository {
  async findById(id: string) {
    return prisma.revenueRecognition.findUnique({
      where: { id },
      include: { events: true },
    });
  }

  async findByReference(reference: string) {
    return prisma.revenueRecognition.findUnique({
      where: { recognitionReference: reference },
      include: { events: true },
    });
  }

  async findByInvoice(invoiceId: string) {
    return prisma.revenueRecognition.findMany({
      where: { invoiceId },
      orderBy: { createdAt: "desc" },
      include: { events: true },
    });
  }

  async findByPayment(paymentId: string) {
    return prisma.revenueRecognition.findMany({
      where: { paymentId },
      orderBy: { createdAt: "desc" },
      include: { events: true },
    });
  }

  async create(data: Prisma.RevenueRecognitionCreateInput): Promise<RevenueRecognition> {
    return prisma.revenueRecognition.create({ data: data as any });
  }

  async update(
    id: string,
    data: Prisma.RevenueRecognitionUpdateInput
  ): Promise<RevenueRecognition> {
    return prisma.revenueRecognition.update({ where: { id }, data });
  }
}

export const revenueRecognitionRepository = new RevenueRecognitionRepository();
