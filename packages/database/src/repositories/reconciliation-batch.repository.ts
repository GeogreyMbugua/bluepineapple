import { prisma } from "../client";
import {
  Prisma,
  ReconciliationBatch,
  ReconciliationStatus,
} from "@prisma/client";

export class ReconciliationBatchRepository {
  async findById(id: string) {
    return prisma.reconciliationBatch.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async findByReference(reference: string) {
    return prisma.reconciliationBatch.findUnique({
      where: { batchReference: reference },
      include: { items: true },
    });
  }

  async findByStatus(status: ReconciliationStatus, limit = 100) {
    return prisma.reconciliationBatch.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { items: true },
    });
  }

  async create(data: Prisma.ReconciliationBatchCreateInput): Promise<ReconciliationBatch> {
    return prisma.reconciliationBatch.create({ data: data as any });
  }

  async update(
    id: string,
    data: Prisma.ReconciliationBatchUpdateInput
  ): Promise<ReconciliationBatch> {
    return prisma.reconciliationBatch.update({ where: { id }, data });
  }
}

export const reconciliationBatchRepository = new ReconciliationBatchRepository();
