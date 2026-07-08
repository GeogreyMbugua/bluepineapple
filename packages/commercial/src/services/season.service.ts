import { prisma } from "@blue-pineapple/database";

export class SeasonService {
  async create(input: any) {
    return prisma.season.create({
      data: {
        name: input.name,
        description: input.description,
        startDate: input.startDate,
        endDate: input.endDate,
        recurring: input.recurring ?? false,
      },
    });
  }

  async findById(id: string) {
    return prisma.season.findUnique({ where: { id } });
  }

  async findActive(date?: Date) {
    return prisma.season.findFirst({
      where: {
        startDate: { lte: date ?? new Date() },
        endDate: { gte: date ?? new Date() },
      },
    });
  }

  async findAll() {
    return prisma.season.findMany({
      orderBy: { startDate: "asc" },
    });
  }
}

export const seasonService = new SeasonService();
