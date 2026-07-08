import { prisma } from "../client";

export class AddOnPriceRepository {
  async findById(id: string) {
    return prisma.addOnPrice.findUnique({
      where: { id },
      include: { addOn: true, priceList: true },
    });
  }

  async findByAddOn(addOnId: string, activeOnly = true) {
    return prisma.addOnPrice.findMany({
      where: {
        addOnId,
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: { priority: "desc" },
    });
  }

  async findActiveByPriceList(priceListId: string) {
    return prisma.addOnPrice.findMany({
      where: {
        priceListId,
        isActive: true,
      },
      include: { addOn: true },
      orderBy: { priority: "desc" },
    });
  }

  async create(data: {
    addOnId: string;
    priceListId?: string;
    name: string;
    description?: string;
    price: number;
    currency?: string;
    effectiveFrom: Date;
    effectiveTo?: Date;
    priority?: number;
    isActive?: boolean;
  }) {
    return prisma.addOnPrice.create({
      data: {
        addOn: { connect: { id: data.addOnId } },
        ...(data.priceListId ? { priceList: { connect: { id: data.priceListId } } } : {}),
        name: data.name,
        description: data.description ?? null,
        price: data.price.toString(),
        currency: data.currency ?? "KES",
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo ?? null,
        priority: data.priority ?? 0,
        isActive: data.isActive ?? true,
      } as any,
    });
  }
}

export const addOnPriceRepository = new AddOnPriceRepository();
