import { prisma } from "@blue-pineapple/database";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";

export class CRMAuditService {
  async log(action: string, entityType: string, entityId: string, actorId?: string, details?: any) {
    try {
      await prisma.commercialAuditLog.create({
        data: {
          action: action as any,
          entityType,
          entityId,
          oldValues: details?.oldValues,
          newValues: details?.newValues,
          metadata: details?.metadata,
          userId: actorId,
          ipAddress: details?.ipAddress,
          userAgent: details?.userAgent,
        },
      });
    } catch (error) {
      console.error("[CRM AUDIT ERROR] Failed to record audit log:", error);
    }
  }

  async findByEntity(entityType: string, entityId: string) {
    return prisma.commercialAuditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  async findByActor(actorId: string, limit = 100) {
    return prisma.commercialAuditLog.findMany({
      where: { userId: actorId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async findByAction(action: string, limit = 100) {
    return prisma.commercialAuditLog.findMany({
      where: { action: action as any },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

export const crmAuditService = new CRMAuditService();
