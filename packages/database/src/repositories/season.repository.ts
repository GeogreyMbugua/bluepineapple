import { prisma } from "../client";

export class SeasonRepository {
  async findById(id: string) {
    return prisma.season.findUnique({ where: { id } });
  }

  async findByName(name: string) {
    return prisma.season.findUnique({ where: { name } });
  }

  async findActive(date: Date) {
    return prisma.season.findFirst({
      where: {
        startDate: { lte: date },
        endDate: { gte: date },
      },
    });
  }

  async findAll() {
    return prisma.season.findMany({
      orderBy: { startDate: "asc" },
    });
  }

  async create(data: {
    name: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    recurring?: boolean;
  }) {
    return prisma.season.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        startDate: data.startDate,
        endDate: data.endDate,
        recurring: data.recurring ?? false,
      },
    });
  }
}

export const seasonRepository = new SeasonRepository();
