import { prisma } from "../client";
import {
  Prisma,
  SettlementItem,
} from "@prisma/client";

export class SettlementItemRepository {
  async findById(id: string) {
    return prisma.settlementItem.findUnique({
      where: { id },
      include: { settlement: true },
    });
  }

  async findBySettlement(settlementId: string) {
    return prisma.settlementItem.findMany({
      where: { settlementId },
      orderBy: { createdAt: "asc" },
    });
  }

  async findByEntity(entityId: string, entityType: string) {
    return prisma.settlementItem.findMany({
      where: { entityId, entityType },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: Prisma.SettlementItemCreateInput): Promise<SettlementItem> {
    return prisma.settlementItem.create({ data: data as any });
  }
}

export const settlementItemRepository = new SettlementItemRepository();
