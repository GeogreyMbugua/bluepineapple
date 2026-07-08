import { prisma } from "../client";
import {
  FinanceAuditAction,
  FinanceAuditLog,
  Prisma,
} from "@prisma/client";

export class FinanceAuditLogRepository {
  async findById(id: string) {
    return prisma.financeAuditLog.findUnique({ where: { id } });
  }

  async findByEntity(entityId: string, entityType?: string) {
    return prisma.financeAuditLog.findMany({
      where: {
        entityId,
        ...(entityType ? { entityType } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByAction(action: FinanceAuditAction) {
    return prisma.financeAuditLog.findMany({
      where: { action },
      orderBy: { createdAt: "desc" },
    });
  }

  async findRecent(limit = 100) {
    return prisma.financeAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async create(data: Prisma.FinanceAuditLogCreateInput): Promise<FinanceAuditLog> {
    return prisma.financeAuditLog.create({ data: data as any });
  }
}

export const financeAuditLogRepository = new FinanceAuditLogRepository();
