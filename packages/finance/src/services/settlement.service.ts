import { prisma } from "@blue-pineapple/database";
import {
  settlementRepository,
  financeAuditLogRepository,
} from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import { LedgerService } from "./ledger.service";
import type { SettlementCreatedEvent, SettlementApprovedEvent, SettlementCompletedEvent, SettlementFailedEvent } from "../events";

export class SettlementService {
  private static generateReference(): string {
    return `STL-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  async createSettlement(input: {
    settlementType: string;
    partnerId?: string;
    recipientName: string;
    recipientAccount: string;
    bankName?: string;
    items: Array<{
      entityType: string;
      entityId: string;
      amount: number;
      currency?: string;
      feeAmount?: number;
      description?: string;
      metadata?: any;
    }>;
    description?: string;
    metadata?: any;
  }, actorId?: string): Promise<{ id: string; settlementReference: string }> {
    const settlementReference = SettlementService.generateReference();
    const totalAmount = input.items.reduce((sum, item) => sum + item.amount, 0);
    const feeTotal = input.items.reduce((sum, item) => sum + (item.feeAmount ?? 0), 0);
    const netAmount = totalAmount - feeTotal;

    const settlement = await prisma.$transaction(async (tx) => {
      const stl = await tx.settlement.create({
        data: {
          settlementReference,
          settlementType: input.settlementType as any,
          status: "CREATED",
          totalAmount: totalAmount.toFixed(2),
          currency: input.items[0]?.currency ?? "KES",
          partnerId: input.partnerId,
          recipientName: input.recipientName,
          recipientAccount: input.recipientAccount,
          bankName: input.bankName,
          description: input.description,
          metadata: input.metadata,
        },
      });

      await tx.settlementItem.createMany({
        data: input.items.map(item => ({
          settlementId: stl.id,
          entityType: item.entityType,
          entityId: item.entityId,
          amount: item.amount.toFixed(2),
          currency: item.currency ?? "KES",
          feeAmount: (item.feeAmount ?? 0).toFixed(2),
          netAmount: (item.amount - (item.feeAmount ?? 0)).toFixed(2),
          description: item.description,
          metadata: item.metadata,
        })),
      });

      return stl;
    });

    await new LedgerService().postJournalEntries([
      {
        entryType: "DEBIT",
        accountCode: "2000",
        accountName: "Accounts Payable",
        amount: netAmount,
        currency: settlement.currency,
        sourceDomain: "FINANCE",
        sourceEntityId: settlement.id,
        sourceEntityType: "Settlement",
        description: `Settlement created: ${settlementReference}`,
      },
      {
        entryType: "CREDIT",
        accountCode: "1000",
        accountName: "Bank",
        amount: netAmount,
        currency: settlement.currency,
        sourceDomain: "FINANCE",
        sourceEntityId: settlement.id,
        sourceEntityType: "Settlement",
        description: `Settlement created: ${settlementReference}`,
      },
    ], actorId);

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "SETTLEMENT_CREATED",
      entityType: "Settlement",
      entityId: settlement.id,
      newValues: { settlementReference, totalAmount, settlementType: input.settlementType },
    });

    eventBus.emit("settlement.created", {
      settlementId: settlement.id,
      settlementReference,
      settlementType: input.settlementType,
      totalAmount,
      currency: settlement.currency,
      recipientId: input.partnerId,
    } as SettlementCreatedEvent);

    return { id: settlement.id, settlementReference: settlement.settlementReference };
  }

  async approveSettlement(settlementId: string, actorId?: string): Promise<void> {
    const settlement = await settlementRepository.findById(settlementId);
    if (!settlement) throw new Error("Settlement not found");

    await prisma.settlement.update({
      where: { id: settlementId, status: "CREATED" },
      data: { status: "APPROVED", approvedAt: new Date() },
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "SETTLEMENT_APPROVED",
      entityType: "Settlement",
      entityId: settlementId,
      newValues: { settlementReference: settlement.settlementReference, status: "APPROVED" },
    });

    eventBus.emit("settlement.approved", {
      settlementId,
      settlementReference: settlement.settlementReference,
    } as SettlementApprovedEvent);
  }

  async processSettlement(settlementId: string, _actorId?: string): Promise<void> {
    await prisma.settlement.update({
      where: { id: settlementId, status: "APPROVED" },
      data: { status: "PROCESSING", processedAt: new Date() },
    });
  }

  async completeSettlement(settlementId: string, _actorId?: string): Promise<void> {
    await prisma.settlement.update({
      where: { id: settlementId, status: "PROCESSING" },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    await financeAuditLogRepository.create({
      userId: _actorId,
      action: "SETTLEMENT_COMPLETED",
      entityType: "Settlement",
      entityId: settlementId,
      newValues: { status: "COMPLETED" },
    });

    eventBus.emit("settlement.completed", {
      settlementId,
      settlementReference: "",
      processedAt: new Date().toISOString(),
    } as SettlementCompletedEvent);
  }

  async failSettlement(settlementId: string, reason: string, actorId?: string): Promise<void> {
    await prisma.settlement.update({
      where: { id: settlementId },
      data: { status: "FAILED", failedAt: new Date(), failureReason: reason },
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "SETTLEMENT_FAILED",
      entityType: "Settlement",
      entityId: settlementId,
      newValues: { status: "FAILED", reason },
    });

    eventBus.emit("settlement.failed", {
      settlementId,
      settlementReference: "",
      reason,
    } as SettlementFailedEvent);
  }

  async findById(id: string) {
    return settlementRepository.findById(id);
  }

  async findByReference(reference: string) {
    return settlementRepository.findByReference(reference);
  }

  async findByStatus(status: string, limit = 100) {
    return settlementRepository.findByStatus(status as any, limit);
  }

  async findByPartner(partnerId: string, limit = 100) {
    const results = await settlementRepository.findByPartner(partnerId);
    return results.slice(0, limit);
  }
}

export const settlementService = new SettlementService();
