import { prisma } from "@blue-pineapple/database";
import {
  reconciliationBatchRepository,
  reconciliationItemRepository,
  financeAuditLogRepository,
} from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import type { ReconciliationStartedEvent, ReconciliationCompletedEvent } from "../events";

export class ReconciliationService {
  private static generateReference(): string {
    return `REC-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  async startReconciliation(input: {
    batchType: string;
    providerStatement?: any;
    ledgerStatement?: any;
    metadata?: any;
  }, actorId?: string): Promise<{ id: string; batchReference: string }> {
    const batchReference = ReconciliationService.generateReference();
    const providerAmount = Number((input.providerStatement?.totalAmount as number) ?? 0);
    const ledgerAmount = Number((input.ledgerStatement?.totalAmount as number) ?? 0);

    const batch = await prisma.reconciliationBatch.create({
      data: {
        batchReference,
        batchType: input.batchType,
        status: "PENDING",
        providerStatement: input.providerStatement,
        ledgerStatement: input.ledgerStatement,
        totalProviderAmount: providerAmount.toFixed(2),
        totalLedgerAmount: ledgerAmount.toFixed(2),
        varianceAmount: Math.abs(providerAmount - ledgerAmount).toFixed(2),
        varianceCount: Math.abs(providerAmount - ledgerAmount) > 0.01 ? 1 : 0,
      },
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "RECONCILIATION_STARTED",
      entityType: "ReconciliationBatch",
      entityId: batch.id,
      newValues: { batchReference, batchType: input.batchType },
    });

    eventBus.emit("reconciliation.started", {
      batchId: batch.id,
      batchReference,
      batchType: input.batchType,
    } as ReconciliationStartedEvent);

    return { id: batch.id, batchReference: batch.batchReference };
  }

  async addReconciliationItem(batchId: string, input: {
    itemType: string;
    providerReference?: string;
    ledgerReference?: string;
    providerAmount?: number;
    ledgerAmount?: number;
    metadata?: any;
  }, _actorId?: string): Promise<{ id: string }> {
    const batch = await reconciliationBatchRepository.findById(batchId);
    if (!batch) throw new Error("Reconciliation batch not found");

    const item = await prisma.reconciliationItem.create({
      data: {
        batchId,
        itemType: input.itemType,
        providerReference: input.providerReference,
        ledgerReference: input.ledgerReference,
        providerAmount: input.providerAmount?.toFixed(2),
        ledgerAmount: input.ledgerAmount?.toFixed(2),
        varianceAmount: Math.abs((input.providerAmount ?? 0) - (input.ledgerAmount ?? 0)).toFixed(2),
        status: Math.abs((input.providerAmount ?? 0) - (input.ledgerAmount ?? 0)) <= 0.01 ? "MATCHED" : "DISCREPANCY",
        metadata: input.metadata,
      },
    });

    if (item.status === "DISCREPANCY") {
      await prisma.reconciliationBatch.update({
        where: { id: batchId },
        data: { varianceCount: { increment: 1 } },
      });
    }

    return { id: item.id };
  }

  async resolveDiscrepancy(itemId: string, resolutionNotes: string, _actorId?: string): Promise<void> {
    const item = await reconciliationItemRepository.findById(itemId);
    if (!item) throw new Error("Reconciliation item not found");

    await prisma.reconciliationItem.update({
      where: { id: itemId, status: "DISCREPANCY" },
        data: { status: "RESOLVED", resolutionNotes, resolvedAt: new Date(), resolvedBy: _actorId },
    });

    const batch = await reconciliationBatchRepository.findById(item.batchId);
    if (batch) {
      const items = await reconciliationItemRepository.findByBatch(batch.id);
      const hasDiscrepancies = items.some(i => i.status === "DISCREPANCY");
      if (!hasDiscrepancies) {
        await prisma.reconciliationBatch.update({
          where: { id: batch.id },
          data: { status: "RECONCILED", reconciledAt: new Date() },
        });

        eventBus.emit("reconciliation.completed", {
          batchId: batch.id,
          batchReference: batch.batchReference,
          varianceCount: batch.varianceCount,
          varianceAmount: Number(batch.varianceAmount),
          reconciledAt: new Date().toISOString(),
        } as ReconciliationCompletedEvent);
      }
    }
  }

  async findBatchById(id: string) {
    return reconciliationBatchRepository.findById(id);
  }

  async findBatchesByStatus(status: string, limit = 100) {
    const results = await reconciliationBatchRepository.findByStatus(status as any);
    return results.slice(0, limit);
  }
}

export const reconciliationService = new ReconciliationService();
