import { prisma } from "@blue-pineapple/database";
import {
  invoiceRepository,
  invoiceItemRepository,
  financeAuditLogRepository,
} from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import { InvoicePolicy } from "../policies";
import { LedgerService } from "./ledger.service";
import type { InvoiceIssuedEvent, InvoiceCancelledEvent } from "../events";

export class InvoiceService {
  private static generateReference(): string {
    return `INV-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  async createFromCommercialSummary(input: {
    bookingId?: string;
    quoteId?: string;
    customerId?: string;
    partnerId?: string;
    commercialSummaryId?: string;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      currency?: string;
      taxRate?: number;
      discountAmount?: number;
      itemType: string;
      referenceId?: string;
    }>;
    dueInDays?: number;
    notes?: string;
    metadata?: any;
  }, _actorId?: string): Promise<{ id: string; invoiceReference: string }> {
    const invoiceReference = InvoiceService.generateReference();
    const now = new Date();
    const dueAt = new Date(now.getTime() + (input.dueInDays ?? 30) * 24 * 60 * 60 * 1000);

    const subtotal = input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const discountTotal = input.items.reduce((sum, item) => sum + (item.discountAmount ?? 0) * item.quantity, 0);
    const taxTotal = input.items.reduce((sum, item) => {
      const lineTotal = item.unitPrice * item.quantity - (item.discountAmount ?? 0) * item.quantity;
      return sum + (item.taxRate ? lineTotal * item.taxRate : 0);
    }, 0);
    const grandTotal = subtotal - discountTotal + taxTotal;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceReference,
        bookingId: input.bookingId,
        quoteId: input.quoteId,
        customerId: input.customerId,
        partnerId: input.partnerId,
        commercialSummaryId: input.commercialSummaryId,
        status: "DRAFT",
        subtotal: subtotal.toFixed(2),
        taxTotal: taxTotal.toFixed(2),
        discountTotal: discountTotal.toFixed(2),
        grandTotal: grandTotal.toFixed(2),
        currency: input.items[0]?.currency ?? "KES",
        outstandingBalance: grandTotal.toFixed(2),
        dueAt,
        notes: input.notes,
        metadata: input.metadata,
      },
    });

    for (const item of input.items) {
      const lineTotal = item.unitPrice * item.quantity;
      const discount = (item.discountAmount ?? 0) * item.quantity;
      const taxAmount = item.taxRate ? (lineTotal - discount) * item.taxRate : 0;
      const totalPrice = lineTotal - discount + taxAmount;

      await invoiceItemRepository.create({
        invoice: { connect: { id: invoice.id } },
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
        currency: item.currency ?? "KES",
        taxRate: item.taxRate,
        taxAmount: taxAmount.toFixed(2),
        discountAmount: discount.toFixed(2),
        itemType: item.itemType,
        referenceId: item.referenceId,
      });
    }

    return { id: invoice.id, invoiceReference: invoice.invoiceReference };
  }

  async issue(invoiceId: string, actorId?: string): Promise<void> {
    const invoice = await invoiceRepository.findById(invoiceId);
    if (!invoice) throw new Error("Invoice not found");
    InvoicePolicy.assertCanIssue(invoice);

    await prisma.$transaction(async (tx) => {
      const updated = await tx.invoice.update({
        where: { id: invoiceId, status: "DRAFT" },
        data: { status: "ISSUED", issuedAt: new Date() },
      });

      await new LedgerService().postEntry({
        entryType: "DEBIT",
        accountCode: "1020",
        accountName: "Accounts Receivable",
        amount: Number(invoice.grandTotal),
        currency: invoice.currency,
        sourceDomain: "FINANCE",
        sourceEntityId: invoiceId,
        sourceEntityType: "Invoice",
        description: `Invoice issued: ${invoice.invoiceReference}`,
        invoiceId,
      }, actorId);

      await new LedgerService().postEntry({
        entryType: "CREDIT",
        accountCode: "4000",
        accountName: "Revenue",
        amount: Number(invoice.grandTotal) - Number(invoice.taxTotal),
        currency: invoice.currency,
        sourceDomain: "FINANCE",
        sourceEntityId: invoiceId,
        sourceEntityType: "Invoice",
        description: `Revenue for invoice: ${invoice.invoiceReference}`,
        invoiceId,
      }, actorId);

      if (Number(invoice.taxTotal) > 0) {
        await new LedgerService().postEntry({
          entryType: "CREDIT",
          accountCode: "2100",
          accountName: "Tax Payable",
          amount: Number(invoice.taxTotal),
          currency: invoice.currency,
          sourceDomain: "FINANCE",
          sourceEntityId: invoiceId,
          sourceEntityType: "Invoice",
          description: `Tax collected for invoice: ${invoice.invoiceReference}`,
          invoiceId,
        }, actorId);
      }

      return updated;
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "INVOICE_ISSUED",
      entityType: "Invoice",
      entityId: invoiceId,
      newValues: { invoiceReference: invoice.invoiceReference, status: "ISSUED", grandTotal: Number(invoice.grandTotal) },
    });

    eventBus.emit("invoice.issued", {
      invoiceId,
      invoiceReference: invoice.invoiceReference,
      bookingId: invoice.bookingId ?? undefined,
      customerId: invoice.customerId ?? undefined,
      partnerId: invoice.partnerId ?? undefined,
      grandTotal: Number(invoice.grandTotal),
      currency: invoice.currency,
      dueAt: invoice.dueAt!.toISOString(),
    } as InvoiceIssuedEvent);
  }

  async cancel(invoiceId: string, reason?: string, actorId?: string): Promise<void> {
    const invoice = await invoiceRepository.findById(invoiceId);
    if (!invoice) throw new Error("Invoice not found");
    InvoicePolicy.assertCanCancel(invoice);

    await prisma.invoice.update({
      where: { id: invoiceId, status: { in: ["ISSUED", "OVERDUE"] } },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "INVOICE_CANCELLED",
      entityType: "Invoice",
      entityId: invoiceId,
      newValues: { invoiceReference: invoice.invoiceReference, status: "CANCELLED", reason },
    });

    eventBus.emit("invoice.cancelled", {
      invoiceId,
      invoiceReference: invoice.invoiceReference,
      reason: reason ?? undefined,
    } as InvoiceCancelledEvent);
  }

  async applyCreditNote(invoiceId: string, creditNoteId: string, amount: number, actorId?: string): Promise<void> {
    const invoice = await invoiceRepository.findById(invoiceId);
    if (!invoice) throw new Error("Invoice not found");
    InvoicePolicy.assertCanApplyCredit(invoice);

    const newOutstanding = Number(invoice.outstandingBalance) - amount;
    if (newOutstanding < 0) throw new Error("Credit note amount exceeds outstanding balance");

    await prisma.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          outstandingBalance: Math.max(0, newOutstanding).toFixed(2),
          creditNoteApplied: (Number(invoice.creditNoteApplied) + amount).toFixed(2),
          status: newOutstanding <= 0.01 ? "PAID" : "ISSUED",
          paidAt: newOutstanding <= 0.01 ? new Date() : undefined,
        },
      });

      await new LedgerService().postEntry({
        entryType: "DEBIT",
        accountCode: "1020",
        accountName: "Accounts Receivable",
        amount,
        currency: invoice.currency,
        sourceDomain: "FINANCE",
        sourceEntityId: invoiceId,
        sourceEntityType: "Invoice",
        description: `Credit note applied: ${creditNoteId}`,
        invoiceId,
      }, actorId);
    });
  }

  async findById(id: string) {
    return invoiceRepository.findById(id);
  }

  async findByReference(reference: string) {
    return invoiceRepository.findByReference(reference);
  }

  async findByCustomer(customerId: string, limit = 100) {
    const results = await invoiceRepository.findByCustomer(customerId);
    return results.slice(0, limit);
  }

  async findByPartner(partnerId: string, limit = 100) {
    const results = await invoiceRepository.findByPartner(partnerId);
    return results.slice(0, limit);
  }

  async findByStatus(status: string, limit = 100) {
    return invoiceRepository.findByStatus(status as any, limit);
  }
}

export const invoiceService = new InvoiceService();
