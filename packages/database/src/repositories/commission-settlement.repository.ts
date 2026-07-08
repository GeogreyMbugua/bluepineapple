import { prisma } from "../client";
import {
  Prisma,
  CommissionSettlement,
} from "@prisma/client";

export class CommissionSettlementRepository {
  async findById(id: string) {
    return prisma.commissionSettlement.findUnique({ where: { id } });
  }

  async findByReference(reference: string) {
    return prisma.commissionSettlement.findUnique({
      where: { commissionReference: reference },
    });
  }

  async findByPartner(partnerId: string) {
    return prisma.commissionSettlement.findMany({
      where: { partnerId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findBySettlementId(settlementId: string) {
    return prisma.commissionSettlement.findMany({
      where: { settlementId },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: Prisma.CommissionSettlementCreateInput): Promise<CommissionSettlement> {
    return prisma.commissionSettlement.create({ data: data as any });
  }

  async update(
    id: string,
    data: Prisma.CommissionSettlementUpdateInput
  ): Promise<CommissionSettlement> {
    return prisma.commissionSettlement.update({ where: { id }, data });
  }

  async updateBySettlementId(
    settlementId: string,
    data: Prisma.CommissionSettlementUpdateInput
  ): Promise<{ count: number }> {
    return prisma.commissionSettlement.updateMany({
      where: { settlementId },
      data,
    });
  }
}

export const commissionSettlementRepository = new CommissionSettlementRepository();
