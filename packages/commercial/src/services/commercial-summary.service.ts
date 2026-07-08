import { prisma } from "@blue-pineapple/database";
import { commercialSummaryRepository } from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";
import { CommercialSummaryPolicy } from "../policies";
import type {
  CommercialSummaryGeneratedEvent,
  CommercialSummaryConfirmedEvent,
} from "../events/commercial.events";

export class CommercialSummaryService {
  static generateReference(): string {
    return `CS-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  static async generate(
    input: {
      bookingId?: string;
      quoteId?: string;
      basePrice: number;
      addOnsTotal: number;
      subtotal: number;
      discountAmount: number;
      taxAmount: number;
      commissionAmount: number;
      totalAmount: number;
      currency: string;
    },
    actorId?: string
  ) {
    CommercialSummaryPolicy.assertCanGenerate(input.bookingId, input.quoteId);

    const summary = await prisma.commercialSummary.create({
      data: {
        summaryReference: CommercialSummaryService.generateReference(),
        bookingId: input.bookingId,
        quoteId: input.quoteId,
        basePrice: input.basePrice.toFixed(2),
        addOnsTotal: input.addOnsTotal.toFixed(2),
        subtotal: input.subtotal.toFixed(2),
        discountAmount: input.discountAmount.toFixed(2),
        taxAmount: input.taxAmount.toFixed(2),
        commissionAmount: input.commissionAmount.toFixed(2),
        totalAmount: input.totalAmount.toFixed(2),
        currency: input.currency,
        status: "FINALIZED",
        generatedAt: new Date(),
      },
    });

      auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: summary.id,
      action: "COMMERCIAL_SUMMARY_GENERATED",
      details: {
        bookingId: input.bookingId,
        quoteId: input.quoteId,
        totalAmount: input.totalAmount.toFixed(2),
        currency: input.currency,
      },
      actorId: actorId ?? undefined,
    });

    (eventBus as any).emit("commercial.summary.generated", {
      summaryId: summary.id,
      summaryReference: summary.summaryReference,
      bookingId: input.bookingId,
      totalAmount: input.totalAmount,
      currency: input.currency,
    } as CommercialSummaryGeneratedEvent);

    return {
      ...summary,
      basePrice: Number(summary.basePrice),
      addOnsTotal: Number(summary.addOnsTotal),
      subtotal: Number(summary.subtotal),
      discountAmount: Number(summary.discountAmount),
      taxAmount: Number(summary.taxAmount),
      commissionAmount: Number(summary.commissionAmount),
      totalAmount: Number(summary.totalAmount),
    };
  }

  async confirm(summaryId: string, actorId?: string) {
    const summary = await commercialSummaryRepository.findById(summaryId);
    if (!summary) {
      throw new Error("Commercial summary not found");
    }
    CommercialSummaryPolicy.assertCanLock(summary);

    const updated = await commercialSummaryRepository.update(summaryId, {
      status: "LOCKED",
      confirmedAt: new Date(),
    } as any);

      auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: summaryId,
      action: "COMMERCIAL_SUMMARY_CONFIRMED",
      details: {
        summaryReference: summary.summaryReference,
      },
      actorId: actorId ?? undefined,
    });

    (eventBus as any).emit("commercial.summary.confirmed", {
      summaryId,
      summaryReference: summary.summaryReference,
      bookingId: summary.bookingId ?? undefined,
    } as CommercialSummaryConfirmedEvent);

    return updated;
  }

  async findById(id: string) {
    return commercialSummaryRepository.findById(id);
  }

  async findByBooking(bookingId: string) {
    return commercialSummaryRepository.findByBooking(bookingId);
  }

  async findByQuote(quoteId: string) {
    return commercialSummaryRepository.findByQuote(quoteId);
  }
}

export const commercialSummaryService = new CommercialSummaryService();
