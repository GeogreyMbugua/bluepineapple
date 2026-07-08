import { prisma } from "../client";

export class CommercialAuditLogRepository {
  async findById(id: string) {
    return prisma.commercialAuditLog.findUnique({ where: { id } });
  }

  async findByEntity(entityType: string, entityId: string, limit = 50) {
    return prisma.commercialAuditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async findByUser(userId: string, limit = 50) {
    return prisma.commercialAuditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async findByAction(action: string, limit = 50) {
    return prisma.commercialAuditLog.findMany({
      where: { action: action as any },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async create(data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId: string;
    oldValues?: any;
    newValues?: any;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.commercialAuditLog.create({
      data: {
        userId: data.userId ?? null,
        action: data.action as any,
        entityType: data.entityType,
        entityId: data.entityId,
        oldValues: data.oldValues,
        newValues: data.newValues,
        metadata: data.metadata,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
      },
    });
  }
}

export const commercialAuditLogRepository = new CommercialAuditLogRepository();
