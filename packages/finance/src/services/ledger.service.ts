import { prisma } from "@blue-pineapple/database";
import {
  ledgerEntryRepository,
  financeAuditLogRepository,
} from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import { LedgerPolicy } from "../policies";
import type { LedgerEntryPostedEvent } from "../events";

export class LedgerService {
  private static generateReference(): string {
    return `LE-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  async postEntry(input: {
    entryType: "DEBIT" | "CREDIT";
    accountCode: string;
    accountName: string;
    amount: number;
    currency?: string;
    exchangeRate?: number;
    sourceDomain: string;
    sourceEntityId: string;
    sourceEntityType: string;
    description: string;
    paymentId?: string;
    invoiceId?: string;
    walletId?: string;
    settlementId?: string;
    refundId?: string;
    taxLedgerEntryId?: string;
    journalEntryId?: string;
    metadata?: any;
    correlationId?: string;
    fiscalPeriodId?: string;
  }, actorId?: string, correlationId?: string): Promise<{ id: string; entryReference: string }> {
    LedgerPolicy.isValidEntryType(input.entryType);
    if (!LedgerPolicy.canPost(input)) {
      throw new Error("Invalid ledger entry input");
    }

    const entryReference = LedgerService.generateReference();
    const baseCurrencyAmount = input.exchangeRate ? input.amount / input.exchangeRate : input.amount;

    const entry = await prisma.ledgerEntry.create({
      data: {
        entryReference,
        entryType: input.entryType,
        accountCode: input.accountCode,
        accountName: input.accountName,
        debitAmount: input.entryType === "DEBIT" ? input.amount.toFixed(2) : undefined,
        creditAmount: input.entryType === "CREDIT" ? input.amount.toFixed(2) : undefined,
        currency: input.currency ?? "KES",
        exchangeRate: input.exchangeRate ? Number(input.exchangeRate.toFixed(6)) : undefined,
        baseCurrencyAmount: baseCurrencyAmount.toFixed(2),
        sourceDomain: input.sourceDomain,
        sourceEntityId: input.sourceEntityId,
        sourceEntityType: input.sourceEntityType,
        description: input.description,
        paymentId: input.paymentId,
        invoiceId: input.invoiceId,
        walletId: input.walletId,
        settlementId: input.settlementId,
        refundId: input.refundId,
        taxLedgerEntryId: input.taxLedgerEntryId,
        journalEntryId: input.journalEntryId,
        metadata: input.metadata,
        postedAt: new Date(),
        createdBy: actorId,
        correlationId: input.correlationId ?? correlationId,
        fiscalPeriodId: input.fiscalPeriodId,
      },
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "LEDGER_ENTRY_POSTED",
      entityType: "LedgerEntry",
      entityId: entry.id,
      newValues: { entryReference, entryType: input.entryType, accountCode: input.accountCode, amount: input.amount },
      metadata: { correlationId },
    });

    eventBus.emit("ledger.entry.posted", {
      ledgerEntryId: entry.id,
      entryReference,
      entryType: input.entryType,
      accountCode: input.accountCode,
      amount: input.amount,
      currency: input.currency ?? "KES",
      sourceDomain: input.sourceDomain,
      sourceEntityId: input.sourceEntityId,
      postedAt: new Date().toISOString(),
    } as LedgerEntryPostedEvent);

    return { id: entry.id, entryReference };
  }

  async postJournalEntries(entries: Array<{
    entryType: "DEBIT" | "CREDIT";
    accountCode: string;
    accountName: string;
    amount: number;
    currency?: string;
    sourceDomain: string;
    sourceEntityId: string;
    sourceEntityType: string;
    description: string;
    correlationId?: string;
  }>, actorId?: string, correlationId?: string): Promise<string[]> {
    const totalDebits = entries.filter(e => e.entryType === "DEBIT").reduce((sum, e) => sum + e.amount, 0);
    const totalCredits = entries.filter(e => e.entryType === "CREDIT").reduce((sum, e) => sum + e.amount, 0);
    LedgerPolicy.assertBalanced(totalDebits, totalCredits);

    const postedIds: string[] = [];
    for (const entry of entries) {
      const result = await this.postEntry({ ...entry, correlationId }, actorId, correlationId);
      postedIds.push(result.id);
    }
    return postedIds;
  }

  async findByAccount(accountCode: string, limit = 100) {
    const entries = await ledgerEntryRepository.findByAccount(accountCode);
    return entries.slice(0, limit);
  }

  async findByEntity(sourceEntityId: string, sourceEntityType: string) {
    return ledgerEntryRepository.findByEntity(sourceEntityId, sourceEntityType);
  }

  async findByCorrelation(correlationId: string) {
    return ledgerEntryRepository.findByCorrelation(correlationId);
  }

  async findByPeriod(fiscalPeriodId: string, limit = 500) {
    const entries = await ledgerEntryRepository.findByPeriod(fiscalPeriodId);
    return entries.slice(0, limit);
  }
}

export const ledgerService = new LedgerService();
