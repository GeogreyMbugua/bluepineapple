import { prisma } from "../client";
export class SeasonRepository {
    async findById(id) {
        return prisma.season.findUnique({ where: { id } });
    }
    async findByName(name) {
        return prisma.season.findUnique({ where: { name } });
    }
    async findActive(date) {
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
    async create(data) {
        return prisma.season.create({
            data: {
                name: data.name,
                description: data.description,
                startDate: data.startDate,
                endDate: data.endDate,
                recurring: data.recurring ?? false,
            },
        });
    }
}
export const seasonRepository = new SeasonRepository();
