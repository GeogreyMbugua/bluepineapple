import { prisma } from "../client";
export class AddOnPriceRepository {
    async findById(id) {
        return prisma.addOnPrice.findUnique({
            where: { id },
            include: { addOn: true, priceList: true },
        });
    }
    async findByAddOn(addOnId, activeOnly = true) {
        return prisma.addOnPrice.findMany({
            where: {
                addOnId,
                ...(activeOnly ? { isActive: true } : {}),
            },
            orderBy: { priority: "desc" },
        });
    }
    async findActiveByPriceList(priceListId) {
        return prisma.addOnPrice.findMany({
            where: {
                priceListId,
                isActive: true,
            },
            include: { addOn: true },
            orderBy: { priority: "desc" },
        });
    }
    async create(data) {
        return prisma.addOnPrice.create({
            data: {
                addOn: { connect: { id: data.addOnId } },
                priceList: data.priceListId ? { connect: { id: data.priceListId } } : undefined,
                name: data.name,
                description: data.description,
                price: data.price.toString(),
                currency: data.currency ?? "KES",
                effectiveFrom: data.effectiveFrom,
                effectiveTo: data.effectiveTo,
                priority: data.priority ?? 0,
                isActive: data.isActive ?? true,
            },
        });
    }
}
export const addOnPriceRepository = new AddOnPriceRepository();
