import { prisma } from "../client";

export class PriceListItemRepository {
  async findById(id: string) {
    return prisma.priceListItem.findUnique({
      where: { id },
      include: { priceList: true },
    });
  }

  async findByPriceList(priceListId: string, activeOnly = true) {
    return prisma.priceListItem.findMany({
      where: {
        priceListId,
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: { name: "asc" },
    });
  }

  async findByIds(ids: string[]) {
    return prisma.priceListItem.findMany({
      where: { id: { in: ids } },
      include: { priceList: true },
    });
  }

  async create(data: {
    priceListId: string;
    name: string;
    description?: string;
    basePrice: number;
    currency?: string;
    customerCategory?: string;
    ageGroup?: string;
    minGuests?: number;
    maxGuests?: number;
    seatClass?: string;
    meta?: any;
  }) {
    return prisma.priceListItem.create({
      data: {
        priceList: { connect: { id: data.priceListId } },
        name: data.name,
        description: data.description ?? null,
        basePrice: data.basePrice.toString(),
        currency: data.currency ?? "KES",
        customerCategory: data.customerCategory ?? null,
        ageGroup: data.ageGroup ?? null,
        minGuests: data.minGuests ?? null,
        maxGuests: data.maxGuests ?? null,
        seatClass: data.seatClass ?? null,
        meta: data.meta ?? null,
      },
    });
  }
}

export const priceListItemRepository = new PriceListItemRepository();
