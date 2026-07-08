import { prisma } from "../client";
import { QuoteStatus, } from "@prisma/client";
export class QuoteRepository {
    async findById(id) {
        return prisma.quote.findUnique({
            where: { id },
            include: {
                items: true,
            },
        });
    }
    async findByReference(reference) {
        return prisma.quote.findUnique({
            where: { quoteReference: reference },
            include: {
                items: true,
            },
        });
    }
    async findActive(limit = 100) {
        return prisma.quote.findMany({
            where: {
                status: QuoteStatus.ACTIVE,
                validUntil: { gte: new Date() },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            include: { items: true },
        });
    }
    async findExpired(limit = 100) {
        return prisma.quote.findMany({
            where: {
                status: { in: [QuoteStatus.DRAFT, QuoteStatus.ACTIVE] },
                validUntil: { lt: new Date() },
            },
            orderBy: { createdAt: "asc" },
            take: limit,
            include: { items: true },
        });
    }
    async create(data) {
        return prisma.quote.create({ data });
    }
    async update(id, data) {
        return prisma.quote.update({ where: { id }, data });
    }
    async updateStatus(id, status) {
        return prisma.quote.update({
            where: { id },
            data: { status },
        });
    }
    async updateIfUnchanged(id, expectedUpdatedAt, data) {
        try {
            return prisma.quote.update({
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
        return prisma.quote.findMany({
            where: { status },
            orderBy: { createdAt: "desc" },
            take: limit,
            include: { items: true },
        });
    }
}
export const quoteRepository = new QuoteRepository();
