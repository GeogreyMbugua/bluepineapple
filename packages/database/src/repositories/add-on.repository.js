import { prisma } from "../client";
export class AddOnRepository {
    async findById(id) {
        return prisma.addOn.findUnique({
            where: { id },
            include: { prices: true },
        });
    }
    async findActive(experienceId, category) {
        return prisma.addOn.findMany({
            where: {
                isActive: true,
                ...(experienceId ? { experienceId } : { experienceId: null }),
                ...(category ? { category: category } : {}),
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
    async findByIds(ids) {
        return prisma.addOn.findMany({
            where: { id: { in: ids } },
            include: { prices: true },
        });
    }
    async create(data) {
        return prisma.addOn.create({
            data: {
                name: data.name,
                description: data.description,
                category: data.category,
                experienceId: data.experienceId,
                isPerPerson: data.isPerPerson ?? true,
                metadata: data.metadata,
            },
        });
    }
}
export const addOnRepository = new AddOnRepository();
