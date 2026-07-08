import { prisma } from "@blue-pineapple/database";
import {
  payoutRepository,
  financeAuditLogRepository,
} from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import { LedgerService } from "./ledger.service";
import type { PayoutCreatedEvent, PayoutProcessedEvent, PayoutCompletedEvent, PayoutFailedEvent } from "../events";

export class PayoutService {
  private static generateReference(): string {
    return `PAYOUT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  async createPayout(input: {
    payoutType: string;
    recipientId: string;
    recipientType: string;
    amount: number;
    currency?: string;
    fee?: number;
    settlementId?: string;
    items: Array<{
      entityType: string;
      entityId: string;
      amount: number;
      currency?: string;
      description?: string;
      metadata?: any;
    }>;
    metadata?: any;
  }, actorId?: string): Promise<{ id: string; payoutReference: string }> {
    const payoutReference = PayoutService.generateReference();
    const fee = input.fee ?? 0;
    const netAmount = input.amount - fee;

    const payout = await prisma.$transaction(async (tx) => {
      const created = await tx.payout.create({
        data: {
          payoutReference,
          payoutType: input.payoutType,
          status: "PENDING",
          recipientId: input.recipientId,
          recipientType: input.recipientType,
          amount: input.amount.toFixed(2),
          currency: input.currency ?? "KES",
          fee: fee.toFixed(2),
          netAmount: netAmount.toFixed(2),
          settlementId: input.settlementId,
          metadata: input.metadata,
        },
      });

      await tx.payoutItem.createMany({
        data: input.items.map(item => ({
          payoutId: created.id,
          entityType: item.entityType,
          entityId: item.entityId,
          amount: item.amount.toFixed(2),
          currency: item.currency ?? "KES",
          description: item.description,
          metadata: item.metadata,
        })),
      });

      return created;
    });

    await new LedgerService().postJournalEntries([
      {
        entryType: "DEBIT",
        accountCode: "6000",
        accountName: "Expenses",
        amount: input.amount,
        currency: input.currency ?? "KES",
        sourceDomain: "FINANCE",
        sourceEntityId: payout.id,
        sourceEntityType: "Payout",
        description: `Payout created: ${payoutReference}`,
      },
      {
        entryType: "CREDIT",
        accountCode: "1000",
        accountName: "Bank",
        amount: fee,
        currency: input.currency ?? "KES",
        sourceDomain: "FINANCE",
        sourceEntityId: payout.id,
        sourceEntityType: "Payout",
        description: `Payout fee: ${payoutReference}`,
      },
    ], actorId);

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "PAYOUT_CREATED",
      entityType: "Payout",
      entityId: payout.id,
      newValues: { payoutReference, amount: input.amount, payoutType: input.payoutType },
    });

    eventBus.emit("payout.created", {
      payoutId: payout.id,
      payoutReference,
      payoutType: input.payoutType,
      amount: input.amount,
      currency: input.currency ?? "KES",
      recipientId: input.recipientId,
    } as PayoutCreatedEvent);

    return { id: payout.id, payoutReference: payout.payoutReference };
  }

  async approvePayout(payoutId: string, _actorId?: string): Promise<void> {
    const payout = await payoutRepository.findById(payoutId);
    if (!payout) throw new Error("Payout not found");

    await prisma.payout.update({
      where: { id: payoutId, status: "PENDING" },
      data: { status: "APPROVED", approvedAt: new Date() },
    });

    eventBus.emit("payout.processed", {
      payoutId,
      payoutReference: payout.payoutReference,
      processedAt: new Date().toISOString(),
    } as PayoutProcessedEvent);
  }

  async processPayout(payoutId: string, _actorId?: string): Promise<void> {
    const payout = await payoutRepository.findById(payoutId);
    if (!payout) throw new Error("Payout not found");

    await prisma.payout.update({
      where: { id: payoutId, status: "APPROVED" },
      data: { status: "PROCESSING", processedAt: new Date() },
    });
  }

  async completePayout(payoutId: string, actorId?: string): Promise<void> {
    const payout = await payoutRepository.findById(payoutId);
    if (!payout) throw new Error("Payout not found");

    await prisma.payout.update({
      where: { id: payoutId, status: "PROCESSING" },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "PAYOUT_COMPLETED",
      entityType: "Payout",
      entityId: payoutId,
      newValues: { payoutReference: payout.payoutReference, status: "COMPLETED" },
    });

    eventBus.emit("payout.completed", {
      payoutId,
      payoutReference: payout.payoutReference,
      completedAt: new Date().toISOString(),
    } as PayoutCompletedEvent);
  }

  async failPayout(payoutId: string, reason: string, actorId?: string): Promise<void> {
    const payout = await payoutRepository.findById(payoutId);
    if (!payout) throw new Error("Payout not found");

    await prisma.payout.update({
      where: { id: payoutId, status: { in: ["PENDING", "APPROVED", "PROCESSING"] } },
      data: { status: "FAILED", failedAt: new Date(), failureReason: reason },
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "PAYOUT_FAILED",
      entityType: "Payout",
      entityId: payoutId,
      newValues: { payoutReference: payout.payoutReference, reason },
    });

    eventBus.emit("payout.failed", {
      payoutId,
      payoutReference: payout.payoutReference,
      reason,
    } as PayoutFailedEvent);
  }

  async reversePayout(payoutId: string, actorId?: string): Promise<void> {
    const payout = await payoutRepository.findById(payoutId);
    if (!payout) throw new Error("Payout not found");

    await prisma.payout.update({
      where: { id: payoutId, status: "COMPLETED" },
      data: { status: "REVERSED" },
    });

    await new LedgerService().postJournalEntries([
      {
        entryType: "CREDIT",
        accountCode: "6000",
        accountName: "Expenses",
        amount: Number(payout.amount),
        currency: payout.currency,
        sourceDomain: "FINANCE",
        sourceEntityId: payoutId,
        sourceEntityType: "Payout",
        description: `Payout reversal: ${payout.payoutReference}`,
      },
      {
        entryType: "DEBIT",
        accountCode: "1000",
        accountName: "Bank",
        amount: Number(payout.amount),
        currency: payout.currency,
        sourceDomain: "FINANCE",
        sourceEntityId: payoutId,
        sourceEntityType: "Payout",
        description: `Payout reversal: ${payout.payoutReference}`,
      },
    ], actorId);
  }

  async findById(id: string) {
    return payoutRepository.findById(id);
  }

  async findByReference(reference: string) {
    return payoutRepository.findByReference(reference);
  }

  async findByStatus(status: string, limit = 100) {
    return payoutRepository.findByStatus(status as any, limit);
  }

  async findByRecipient(recipientId: string, limit = 100) {
    const results = await payoutRepository.findByRecipient(recipientId, "PARTNER");
    return results.slice(0, limit);
  }
}

export const payoutService = new PayoutService();
