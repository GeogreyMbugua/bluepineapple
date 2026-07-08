import { prisma } from "../client";
import {
  PriceList,
  PriceStatus,
  Prisma,
} from "@prisma/client";

export class PriceListRepository {
  async findById(id: string) {
    return prisma.priceList.findUnique({
      where: { id },
      include: {
        items: true,
        rules: true,
        addOnPrices: true,
      },
    });
  }

  async findActiveByExperience(experienceId: string, effectiveDate?: Date) {
    const date = effectiveDate ?? new Date();
    return prisma.priceList.findFirst({
      where: {
        experienceId,
        status: PriceStatus.ACTIVE,
        isActive: true,
        effectiveFrom: { lte: date },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: date } },
        ],
      },
      include: {
        items: { where: { isActive: true } },
        rules: { where: { isActive: true }, orderBy: { priority: "desc" } },
      },
      orderBy: { priority: "desc" },
    });
  }

  async findActiveGlobal(effectiveDate?: Date) {
    const date = effectiveDate ?? new Date();
    return prisma.priceList.findFirst({
      where: {
        experienceId: null,
        status: PriceStatus.ACTIVE,
        isActive: true,
        effectiveFrom: { lte: date },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: date } },
        ],
      },
      include: {
        items: { where: { isActive: true } },
        rules: { where: { isActive: true }, orderBy: { priority: "desc" } },
      },
      orderBy: { priority: "desc" },
    });
  }

  async findByIds(ids: string[]) {
    return prisma.priceList.findMany({
      where: { id: { in: ids } },
      include: {
        items: true,
        rules: true,
      },
    });
  }

  async create(data: Prisma.PriceListCreateInput): Promise<PriceList> {
    return prisma.priceList.create({ data });
  }

  async update(id: string, data: Prisma.PriceListUpdateInput): Promise<PriceList> {
    return prisma.priceList.update({ where: { id }, data });
  }

  async updateIfUnchanged(
    id: string,
    expectedUpdatedAt: Date,
    data: Prisma.PriceListUpdateInput
  ): Promise<PriceList | null> {
    try {
      return prisma.priceList.update({
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

  async findByStatus(status: PriceStatus, limit = 100) {
    return prisma.priceList.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { items: true },
    });
  }
}

export const priceListRepository = new PriceListRepository();
