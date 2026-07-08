import { prisma } from "@blue-pineapple/database";
import {
  journalEntryRepository,
  journalEntryItemRepository,
  accountRepository,
  ledgerEntryRepository,
  financeAuditLogRepository,
} from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import { AccountingPolicy, LedgerPolicy } from "../policies";
import { LedgerService } from "./ledger.service";
import type { JournalEntryCreatedEvent, JournalEntryPostedEvent } from "../events";

export class AccountingService {
  async createJournalEntry(input: {
    journalReference?: string;
    description: string;
    entryDate: Date;
    fiscalPeriodId?: string;
    items: Array<{
      accountId: string;
      entryType: "DEBIT" | "CREDIT";
      debitAmount?: number;
      creditAmount?: number;
      currency?: string;
      description?: string;
      metadata?: any;
    }>;
    metadata?: any;
  }, actorId?: string): Promise<{ id: string; journalReference: string }> {
    const journalReference = input.journalReference ?? `JE-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const totalDebits = input.items.filter(i => i.entryType === "DEBIT").reduce((sum, i) => sum + (i.debitAmount ?? 0), 0);
    const totalCredits = input.items.filter(i => i.entryType === "CREDIT").reduce((sum, i) => sum + (i.creditAmount ?? 0), 0);
    LedgerPolicy.assertBalanced(totalDebits, totalCredits);

    const entry = await prisma.$transaction(async (tx) => {
      const created = await tx.journalEntry.create({
        data: {
          journalReference,
          status: "DRAFT",
          entryDate: input.entryDate,
          description: input.description,
          totalDebit: totalDebits.toFixed(2),
          totalCredit: totalCredits.toFixed(2),
          fiscalPeriodId: input.fiscalPeriodId,
          isBalanced: true,
          metadata: input.metadata,
        } as any,
      });

      for (const item of input.items) {
        const account = await accountRepository.findById(item.accountId);
        if (!account) throw new Error(`Account not found: ${item.accountId}`);

        await journalEntryItemRepository.create({
          journalEntry: { connect: { id: created.id } },
          account: { connect: { id: item.accountId } },
          accountCode: account.accountCode,
          accountName: account.accountName,
          entryType: item.entryType,
          debitAmount: item.entryType === "DEBIT" ? (item.debitAmount ?? 0).toFixed(2) : undefined,
          creditAmount: item.entryType === "CREDIT" ? (item.creditAmount ?? 0).toFixed(2) : undefined,
          currency: item.currency ?? "KES",
          description: item.description,
          metadata: item.metadata,
        });
      }

      return created;
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "JOURNAL_ENTRY_CREATED" as any,
      entityType: "JournalEntry",
      entityId: entry.id,
      newValues: { journalReference, description: input.description, totalDebit: totalDebits, totalCredit: totalCredits } as any,
    });

    eventBus.emit("journal.entry.created", {
      journalEntryId: entry.id,
      journalReference,
      description: input.description,
      totalDebit: totalDebits,
      totalCredit: totalCredits,
      entryDate: input.entryDate.toISOString(),
    } as JournalEntryCreatedEvent);

    return { id: entry.id, journalReference };
  }

  async postJournalEntry(journalEntryId: string, actorId?: string): Promise<void> {
    const entry = await journalEntryRepository.findById(journalEntryId);
    if (!entry) throw new Error("Journal entry not found");
    AccountingPolicy.assertCanPostJournal(entry);

    await prisma.$transaction(async (tx) => {
      const updated = await tx.journalEntry.update({
        where: { id: journalEntryId, status: "DRAFT" },
        data: { status: "POSTED", postedAt: new Date() },
      });

      const items = await tx.journalEntryItem.findMany({
        where: { journalEntryId },
      });

      for (const item of items) {
        const amount = item.entryType === "DEBIT" ? Number(item.debitAmount) : Number(item.creditAmount);
        if (amount <= 0) continue;

        await new LedgerService().postEntry({
          entryType: item.entryType,
          accountCode: item.accountCode,
          accountName: item.accountName,
          amount,
          currency: item.currency,
          sourceDomain: "FINANCE",
          sourceEntityId: journalEntryId,
          sourceEntityType: "JournalEntry",
          description: item.description ?? `Journal entry: ${updated.journalReference}`,
          journalEntryId,
        }, actorId);
      }
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "JOURNAL_ENTRY_POSTED" as any,
      entityType: "JournalEntry",
      entityId: journalEntryId,
      newValues: { journalReference: entry.journalReference, status: "POSTED" } as any,
    });

    eventBus.emit("journal.entry.posted", {
      journalEntryId,
      journalReference: entry.journalReference,
      postedAt: new Date().toISOString(),
    } as JournalEntryPostedEvent);
  }

  async reverseJournalEntry(journalEntryId: string, reason: string, actorId?: string): Promise<void> {
    const entry = await journalEntryRepository.findById(journalEntryId);
    if (!entry) throw new Error("Journal entry not found");
    AccountingPolicy.assertCanReverse(entry);

    const reversalReference = `JE-REV-${Date.now()}`;

    await prisma.$transaction(async (tx) => {
      await tx.journalEntry.update({
        where: { id: journalEntryId, status: "POSTED" },
        data: { status: "REVERSED", reversedAt: new Date(), reversalReference },
      });

      for (const item of entry.items) {
        const amount = item.entryType === "DEBIT" ? Number(item.debitAmount) : Number(item.creditAmount);
        if (amount <= 0) continue;

        await new LedgerService().postEntry({
          entryType: item.entryType === "DEBIT" ? "CREDIT" : "DEBIT",
          accountCode: item.accountCode,
          accountName: item.accountName,
          amount,
          currency: item.currency,
          sourceDomain: "FINANCE",
          sourceEntityId: journalEntryId,
          sourceEntityType: "JournalEntry",
          description: `Reversal of ${entry.journalReference}: ${reason}`,
          journalEntryId,
        }, actorId);
      }
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "JOURNAL_ENTRY_REVERSED" as any,
      entityType: "JournalEntry",
      entityId: journalEntryId,
      newValues: { status: "REVERSED", reason } as any,
    });
  }

  async getTrialBalance(fiscalPeriodId?: string) {
    const entries = fiscalPeriodId
      ? await ledgerEntryRepository.findByPeriod(fiscalPeriodId)
      : [];
    const balances: Record<string, { accountCode: string; accountName: string; debit: number; credit: number }> = {};

    for (const entry of entries) {
      const key = entry.accountCode;
      if (!balances[key]) balances[key] = { accountCode: entry.accountCode, accountName: entry.accountName, debit: 0, credit: 0 };
      if (entry.entryType === "DEBIT") balances[key].debit += Number(entry.debitAmount ?? 0);
      else balances[key].credit += Number(entry.creditAmount ?? 0);
    }

    return Object.values(balances);
  }

  async findById(id: string) {
    return journalEntryRepository.findById(id);
  }

  async findByReference(reference: string) {
    return journalEntryRepository.findByReference(reference);
  }

  async findByStatus(status: string, limit = 100) {
    return journalEntryRepository.findByStatus(status as any, limit);
  }
}

export const accountingService = new AccountingService();