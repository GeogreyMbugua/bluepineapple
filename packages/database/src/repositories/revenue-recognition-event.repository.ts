import { prisma } from "../client";
import {
  Prisma,
  RevenueRecognitionEvent,
} from "@prisma/client";

export class RevenueRecognitionEventRepository {
  async findById(id: string) {
    return prisma.revenueRecognitionEvent.findUnique({
      where: { id },
      include: { revenueRecognition: true },
    });
  }

  async findByRecognition(revenueRecognitionId: string) {
    return prisma.revenueRecognitionEvent.findMany({
      where: { revenueRecognitionId },
      orderBy: { eventDate: "desc" },
    });
  }

  async create(data: Prisma.RevenueRecognitionEventCreateInput): Promise<RevenueRecognitionEvent> {
    return prisma.revenueRecognitionEvent.create({ data: data as any });
  }
}

export const revenueRecognitionEventRepository = new RevenueRecognitionEventRepository();
