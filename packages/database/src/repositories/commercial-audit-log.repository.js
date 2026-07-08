import { prisma } from "../client";
export class CommercialAuditLogRepository {
    async findById(id) {
        return prisma.commercialAuditLog.findUnique({ where: { id } });
    }
    async findByEntity(entityType, entityId, limit = 50) {
        return prisma.commercialAuditLog.findMany({
            where: { entityType, entityId },
            orderBy: { createdAt: "desc" },
            take: limit,
        });
    }
    async findByUser(userId, limit = 50) {
        return prisma.commercialAuditLog.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: limit,
        });
    }
    async findByAction(action, limit = 50) {
        return prisma.commercialAuditLog.findMany({
            where: { action: action },
            orderBy: { createdAt: "desc" },
            take: limit,
        });
    }
    async create(data) {
        return prisma.commercialAuditLog.create({
            data: {
                userId: data.userId,
                action: data.action,
                entityType: data.entityType,
                entityId: data.entityId,
                oldValues: data.oldValues,
                newValues: data.newValues,
                metadata: data.metadata,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
            },
        });
    }
}
export const commercialAuditLogRepository = new CommercialAuditLogRepository();
