import { prisma } from "../client";
import type { Experience, ExperienceCategory, Prisma } from "@prisma/client";

export class ExperienceRepository {
  async findById(id: string): Promise<Experience | null> {
    return prisma.experience.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Experience | null> {
    return prisma.experience.findUnique({ where: { slug } });
  }

  async findActive(): Promise<Experience[]> {
    return prisma.experience.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  }

  async findFeatured(): Promise<Experience[]> {
    return prisma.experience.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { name: "asc" },
    });
  }

  async findWithRoutes(id: string) {
    return prisma.experience.findUnique({
      where: { id },
      include: {
        routes: {
          include: { route: { include: { stops: { orderBy: { sequence: "asc" } } } } },
        },
      },
    });
  }

  async create(data: Prisma.ExperienceCreateInput): Promise<Experience> {
    return prisma.experience.create({ data });
  }

  async update(id: string, data: Prisma.ExperienceUpdateInput): Promise<Experience> {
    return prisma.experience.update({ where: { id }, data });
  }

  async listByCategory(category: ExperienceCategory): Promise<Experience[]> {
    return prisma.experience.findMany({
      where: { category, isActive: true },
      orderBy: { name: "asc" },
    });
  }

  async search(query: string): Promise<Experience[]> {
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
