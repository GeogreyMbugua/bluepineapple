import { prisma } from "../client";
import { PriceStatus, } from "@prisma/client";
export class PriceListRepository {
    async findById(id) {
        return prisma.priceList.findUnique({
            where: { id },
            include: {
                items: true,
                rules: true,
                addOnPrices: true,
            },
        });
    }
    async findActiveByExperience(experienceId, effectiveDate) {
        const date = effectiveDate ?? new Date();
        return prisma.priceList.findFirst({
            where: {
                experienceId,
                status: PriceStatus.ACTIVE,
                isActive: true,
                effectiveFrom: { lte: date },
                OR: [
                    { effectiveTo: null },
                    { effectiveTo: { gte: date } },
                ],
            },
            include: {
                items: { where: { isActive: true } },
                rules: { where: { isActive: true }, orderBy: { priority: "desc" } },
            },
            orderBy: { priority: "desc" },
        });
    }
    async findActiveGlobal(effectiveDate) {
        const date = effectiveDate ?? new Date();
        return prisma.priceList.findFirst({
            where: {
                experienceId: null,
                status: PriceStatus.ACTIVE,
                isActive: true,
                effectiveFrom: { lte: date },
                OR: [
                    { effectiveTo: null },
                    { effectiveTo: { gte: date } },
                ],
            },
            include: {
                items: { where: { isActive: true } },
                rules: { where: { isActive: true }, orderBy: { priority: "desc" } },
            },
            orderBy: { priority: "desc" },
        });
    }
    async findByIds(ids) {
        return prisma.priceList.findMany({
            where: { id: { in: ids } },
            include: {
                items: true,
                rules: true,
            },
        });
    }
    async create(data) {
        return prisma.priceList.create({ data });
    }
    async update(id, data) {
        return prisma.priceList.update({ where: { id }, data });
    }
    async updateIfUnchanged(id, expectedUpdatedAt, data) {
        try {
            return prisma.priceList.update({
                where: { id, updatedAt: expectedUpdatedAt },
                data,
            });
        }
        catch (error) {
            if (error instanceof Error && error.message.includes("Record to update not found")) {
                return null;
            }
            throw error;
        }
    }
    async findByStatus(status, limit = 100) {
        return prisma.priceList.findMany({
            where: { status },
            orderBy: { createdAt: "desc" },
            take: limit,
            include: { items: true },
        });
    }
}
export const priceListRepository = new PriceListRepository();
