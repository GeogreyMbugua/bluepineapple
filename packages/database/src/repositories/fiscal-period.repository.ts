import { prisma } from "../client";
import {
  FiscalPeriod,
  Prisma,
} from "@prisma/client";

export class FiscalPeriodRepository {
  async findById(id: string) {
    return prisma.fiscalPeriod.findUnique({ where: { id } });
  }

  async findByCode(code: string) {
    return prisma.fiscalPeriod.findUnique({ where: { periodCode: code } });
  }

  async findCurrent() {
    const now = new Date();
    return prisma.fiscalPeriod.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });
  }

  async create(data: Prisma.FiscalPeriodCreateInput): Promise<FiscalPeriod> {
    return prisma.fiscalPeriod.create({ data });
  }

  async update(
    id: string,
    data: Prisma.FiscalPeriodUpdateInput
  ): Promise<FiscalPeriod> {
    return prisma.fiscalPeriod.update({ where: { id }, data });
  }
}

export const fiscalPeriodRepository = new FiscalPeriodRepository();
