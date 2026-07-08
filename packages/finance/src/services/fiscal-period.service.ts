import { prisma } from "@blue-pineapple/database";
import { fiscalPeriodRepository, financeAuditLogRepository } from "@blue-pineapple/database";

export class FiscalPeriodService {
  static generatePeriodCode(startDate: Date, _endDate: Date): string {
    const y = startDate.getFullYear();
    const m = String(startDate.getMonth() + 1).padStart(2, "0");
    return `FP-${y}${m}`;
  }

  async createPeriod(input: {
    periodCode?: string;
    periodName: string;
    startDate: Date;
    _endDate: Date;
  }, actorId?: string): Promise<{ id: string; periodCode: string }> {
     const periodCode = input.periodCode ?? FiscalPeriodService.generatePeriodCode(input.startDate, input._endDate);

    const period = await prisma.fiscalPeriod.create({
      data: {
        periodCode,
        periodName: input.periodName,
        startDate: input.startDate,
        endDate: input._endDate,
        isClosed: false,
      },
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "JOURNAL_ENTRY_CREATED",
      entityType: "FiscalPeriod",
      entityId: period.id,
      newValues: { periodCode, periodName: input.periodName },
    });

    return { id: period.id, periodCode: period.periodCode };
  }

  async closePeriod(periodId: string, actorId?: string): Promise<void> {
    const period = await fiscalPeriodRepository.findById(periodId);
    if (!period) throw new Error("Fiscal period not found");

    await prisma.fiscalPeriod.update({
      where: { id: periodId, isClosed: false },
      data: { isClosed: true, closedAt: new Date(), closedBy: actorId },
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "JOURNAL_ENTRY_POSTED",
      entityType: "FiscalPeriod",
      entityId: periodId,
      newValues: { periodCode: period.periodCode, isClosed: true },
    });
  }

  async findCurrentPeriod() {
    const now = new Date();
    return prisma.fiscalPeriod.findFirst({
      where: { startDate: { lte: now }, endDate: { gte: now }, isClosed: false },
    });
  }

  async findById(id: string) {
    return fiscalPeriodRepository.findById(id);
  }

  async findByCode(code: string) {
    return fiscalPeriodRepository.findByCode(code);
  }
}

export const fiscalPeriodService = new FiscalPeriodService();
