import { prisma } from "../client";
export class PriceListItemRepository {
    async findById(id) {
        return prisma.priceListItem.findUnique({
            where: { id },
            include: { priceList: true },
        });
    }
    async findByPriceList(priceListId, activeOnly = true) {
        return prisma.priceListItem.findMany({
            where: {
                priceListId,
                ...(activeOnly ? { isActive: true } : {}),
            },
            orderBy: { name: "asc" },
        });
    }
    async findByIds(ids) {
        return prisma.priceListItem.findMany({
            where: { id: { in: ids } },
            include: { priceList: true },
        });
    }
    async create(data) {
        return prisma.priceListItem.create({
            data: {
                priceList: { connect: { id: data.priceListId } },
                name: data.name,
                description: data.description,
                basePrice: data.basePrice.toString(),
                currency: data.currency ?? "KES",
                customerCategory: data.customerCategory,
                ageGroup: data.ageGroup,
                minGuests: data.minGuests,
                maxGuests: data.maxGuests,
                seatClass: data.seatClass,
                meta: data.meta,
            },
        });
    }
}
export const priceListItemRepository = new PriceListItemRepository();
