import { prisma } from "../client";

export class AddOnRepository {
  async findById(id: string) {
    return prisma.addOn.findUnique({
      where: { id },
      include: { prices: true },
    });
  }

  async findActive(experienceId?: string, category?: string) {
    return prisma.addOn.findMany({
      where: {
        isActive: true,
        ...(experienceId ? { experienceId } : { experienceId: null }),
        ...(category ? { category: category as any } : {}),
      },
      include: {
        prices: {
          where: { isActive: true },
          orderBy: { priority: "desc" },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async findByIds(ids: string[]) {
    return prisma.addOn.findMany({
      where: { id: { in: ids } },
      include: { prices: true },
    });
  }

  async create(data: {
    name: string;
    description?: string;
    category: string;
    experienceId?: string;
    isPerPerson?: boolean;
    metadata?: any;
  }) {
    return prisma.addOn.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        category: data.category as any,
        experienceId: data.experienceId ?? null,
        isPerPerson: data.isPerPerson ?? true,
        metadata: data.metadata ?? null,
      },
    });
  }
}

export const addOnRepository = new AddOnRepository();
