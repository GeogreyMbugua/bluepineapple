import { financeAuditLogRepository } from "@blue-pineapple/database";

export class FinanceAuditService {
  async log(
    action: string,
    userId: string | undefined,
    entityType: string,
    entityId: string,
    oldValues?: any,
    newValues?: any,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await financeAuditLogRepository.create({
      userId,
      action: action as any,
      entityType,
      entityId,
      oldValues,
      newValues,
      metadata,
      ipAddress,
      userAgent,
    } as any);
  }

  async getHistory(_entityType: string, _entityId: string, _limit = 50) {
    return financeAuditLogRepository.findByEntity(_entityId);
  }

  async getRecentActions(_limit = 100) {
    return financeAuditLogRepository.findRecent(_limit);
  }

  async findByAction(action: string, _limit = 100) {
    return financeAuditLogRepository.findByAction(action as any);
  }
}

export const financeAuditService = new FinanceAuditService();
