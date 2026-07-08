import { prisma } from "../client";
import {
  Prisma,
  Settlement,
  SettlementStatus,
} from "@prisma/client";

export class SettlementRepository {
  async findById(id: string) {
    return prisma.settlement.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async findByReference(reference: string) {
    return prisma.settlement.findUnique({
      where: { settlementReference: reference },
      include: { items: true },
    });
  }

  async findByStatus(status: SettlementStatus, limit = 100) {
    return prisma.settlement.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { items: true },
    });
  }

  async findByPartner(partnerId: string) {
    return prisma.settlement.findMany({
      where: { partnerId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
  }

  async create(data: Prisma.SettlementCreateInput): Promise<Settlement> {
    return prisma.settlement.create({ data: data as any });
  }

  async update(
    id: string,
    data: Prisma.SettlementUpdateInput
  ): Promise<Settlement> {
    return prisma.settlement.update({ where: { id }, data });
  }
}

export const settlementRepository = new SettlementRepository();
