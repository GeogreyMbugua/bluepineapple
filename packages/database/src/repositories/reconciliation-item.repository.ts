import { prisma } from "../client";
import {
  Prisma,
  ReconciliationItem,
} from "@prisma/client";

export class ReconciliationItemRepository {
  async findById(id: string) {
    return prisma.reconciliationItem.findUnique({
      where: { id },
      include: { batch: true },
    });
  }

  async findByBatch(batchId: string) {
    return prisma.reconciliationItem.findMany({
      where: { batchId },
      orderBy: { createdAt: "asc" },
      include: { batch: true },
    });
  }

  async create(data: Prisma.ReconciliationItemCreateInput): Promise<ReconciliationItem> {
    return prisma.reconciliationItem.create({ data: data as any });
  }

  async update(
    id: string,
    data: Prisma.ReconciliationItemUpdateInput
  ): Promise<ReconciliationItem> {
    return prisma.reconciliationItem.update({ where: { id }, data });
  }
}

export const reconciliationItemRepository = new ReconciliationItemRepository();
