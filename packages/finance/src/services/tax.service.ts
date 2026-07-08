import { prisma } from "@blue-pineapple/database";
import {
  taxLedgerEntryRepository,
  financeAuditLogRepository,
} from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import { TaxPolicy } from "../policies";
import { LedgerService } from "./ledger.service";
import type { TaxPostedEvent } from "../events";

export class TaxService {
  async postTaxEntry(input: {
    taxCategory: string;
    taxRuleId?: string;
    taxableAmount: number;
    taxAmount: number;
    currency?: string;
    rate: number;
    isInclusive?: boolean;
    jurisdiction: string;
    sourceDomain: string;
    sourceEntityId: string;
    sourceEntityType: string;
    description: string;
    metadata?: any;
  }, actorId?: string): Promise<{ id: string }> {
    TaxPolicy.assertCanPost({ taxAmount: input.taxAmount });

    const entry = await prisma.$transaction(async (tx) => {
      const taxEntry = await tx.taxLedgerEntry.create({
        data: {
          taxCategory: input.taxCategory as any,
          taxRuleId: input.taxRuleId,
          taxableAmount: input.taxableAmount.toFixed(2),
          taxAmount: input.taxAmount.toFixed(2),
          currency: input.currency ?? "KES",
          rate: input.rate,
          isInclusive: input.isInclusive ?? false,
          jurisdiction: input.jurisdiction,
          sourceDomain: input.sourceDomain,
          sourceEntityId: input.sourceEntityId,
          sourceEntityType: input.sourceEntityType,
          description: input.description,
          metadata: input.metadata,
          postedAt: new Date(),
        },
      });

      await new LedgerService().postEntry({
        entryType: "CREDIT",
        accountCode: "2100",
        accountName: "Tax Payable",
        amount: input.taxAmount,
        currency: input.currency ?? "KES",
        sourceDomain: "FINANCE",
        sourceEntityId: input.sourceEntityId,
        sourceEntityType: "TaxLedgerEntry",
        description: input.description,
        taxLedgerEntryId: taxEntry.id,
      }, actorId);

      return taxEntry;
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "TAX_POSTED",
      entityType: "TaxLedgerEntry",
      entityId: entry.id,
      newValues: { taxCategory: input.taxCategory, taxableAmount: input.taxableAmount, taxAmount: input.taxAmount },
    });

    eventBus.emit("tax.posted", {
      taxLedgerEntryId: entry.id,
      taxCategory: input.taxCategory,
      taxableAmount: input.taxableAmount,
      taxAmount: input.taxAmount,
      currency: input.currency ?? "KES",
      sourceEntityId: input.sourceEntityId,
      postedAt: new Date().toISOString(),
    } as TaxPostedEvent);

    return { id: entry.id };
  }

  async getTaxByEntity(sourceEntityId: string, sourceEntityType: string) {
    return taxLedgerEntryRepository.findByEntity(sourceEntityId, sourceEntityType);
  }

  async getTaxByJurisdiction(jurisdiction: string, limit = 500) {
    const results = await taxLedgerEntryRepository.findByJurisdiction(jurisdiction);
    return results.slice(0, limit);
  }

  static calculateTaxBreakdown(amount: number, taxRules: Array<{ rate: number; isInclusive?: boolean; type: string }>): Array<{ type: string; taxableAmount: number; taxAmount: number }> {
    return taxRules.map(rule => {
      const taxableAmount = rule.isInclusive ? amount / (1 + rule.rate) : amount;
      const taxAmount = taxableAmount * rule.rate;
      return { type: rule.type, taxableAmount, taxAmount };
    });
  }
}

export const taxService = new TaxService();
