import { prisma } from "../client";
export class ExperienceRepository {
    async findById(id) {
        return prisma.experience.findUnique({ where: { id } });
    }
    async findBySlug(slug) {
        return prisma.experience.findUnique({ where: { slug } });
    }
    async findActive() {
        return prisma.experience.findMany({
            where: { isActive: true },
            orderBy: { name: "asc" },
        });
    }
    async findFeatured() {
        return prisma.experience.findMany({
            where: { isActive: true, isFeatured: true },
            orderBy: { name: "asc" },
        });
    }
    async findWithRoutes(id) {
        return prisma.experience.findUnique({
            where: { id },
            include: {
                routes: {
                    include: { route: { include: { stops: { orderBy: { sequence: "asc" } } } } },
                },
            },
        });
    }
    async create(data) {
        return prisma.experience.create({ data });
    }
    async update(id, data) {
        return prisma.experience.update({ where: { id }, data });
    }
    async listByCategory(category) {
        return prisma.experience.findMany({
            where: { category, isActive: true },
            orderBy: { name: "asc" },
        });
    }
    async search(query) {
        return prisma.experience.findMany({
            where: {
                isActive: true,
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                ],
            },
            take: 20,
        });
    }
}
export const experienceRepository = new ExperienceRepository();
