import { prisma, quoteRepository, quoteItemRepository, taxRuleRepository, addOnRepository, addOnPriceRepository } from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";
import { z } from "zod";
import type { PricingContext, PricingResult } from "../domain/commercial.types";
import type {
  QuoteCreatedEvent,
  QuoteExpiredEvent,
  QuoteConvertedEvent,
  QuoteCancelledEvent,
  CommercialSummaryGeneratedEvent,
} from "../events/commercial.events";
import { QuotationPolicy, PromotionPolicy } from "../policies";
import { pricingService } from "./pricing.service";
import { promotionService } from "./promotion.service";
import { CreateQuoteSchema } from "../validators/commercial.schema";

export class QuotationService {
  async createQuote(input: z.infer<typeof CreateQuoteSchema>, actorId?: string): Promise<any> {
    if (!QuotationPolicy.canCreate(input.experienceId ?? undefined)) {
      throw new Error("Cannot create quote: experience ID is required");
    }

    const pricingContext: PricingContext = {
      experienceId: input.experienceId ?? undefined,
      departureId: input.departureId ?? undefined,
      customerCategory: input.customerCategory,
      groupSize: input.guestCount,
    };

    const pricing = await pricingService.calculatePrice(pricingContext.experienceId || "", pricingContext);

    const activePromotions = await promotionService.findActive(new Date());

    const addOns = input.addOns && input.addOns.length > 0
      ? await addOnRepository.findByIds(input.addOns.map((a: any) => a.addOnId))
      : [];

    const quoteItems: any[] = [];

    quoteItems.push({
      type: "BASE",
      description: "Base experience price",
      quantity: input.guestCount,
      unitPrice: pricing.basePrice,
      totalPrice: pricing.basePrice * input.guestCount,
      currency: pricing.currency,
    });

    const addOnCharges: any[] = [];
    if (addOns && addOns.length > 0) {
      for (const addOnInput of input.addOns ?? []) {
        const addOn = addOns.find((a: any) => a.id === addOnInput.addOnId);
        if (addOn) {
          const activePrice = addOn.prices?.find((p: any) => p.isActive);
          const price = activePrice?.price?.toNumber?.() ?? Number(activePrice?.price ?? 0);
          const total = price * addOnInput.quantity * (addOn.isPerPerson ? input.guestCount : 1);
          addOnCharges.push({
            addOnId: addOn.id,
            addOnName: addOn.name,
            price,
            quantity: addOnInput.quantity,
            total,
            isPerPerson: addOn.isPerPerson,
            category: addOn.category,
          });
          quoteItems.push({
            type: "ADDON",
            description: addOn.name,
            quantity: addOnInput.quantity * (addOn.isPerPerson ? input.guestCount : 1),
            unitPrice: price,
            totalPrice: total,
            currency: pricing.currency,
            meta: { addOnId: addOn.id },
          });
        }
      }
    }

    const taxes = await taxRuleRepository.findActive();
    const taxCharges: any[] = [];
    const subtotalBeforeTax = quoteItems.reduce((sum, item) => sum + item.totalPrice, 0);

    for (const taxRule of taxes) {
      const rate = taxRule.rate?.toNumber?.() ?? Number(taxRule.rate ?? 0);
      const taxAmount = rate * subtotalBeforeTax;
      taxCharges.push({
        taxRuleId: taxRule.id,
        taxName: taxRule.name,
        rate,
        taxableAmount: subtotalBeforeTax,
        taxAmount,
        isInclusive: taxRule.isInclusive,
        jurisdiction: taxRule.jurisdiction,
      });
      quoteItems.push({
        type: "TAX",
        description: taxRule.name,
        quantity: 1,
        unitPrice: taxAmount,
        totalPrice: taxAmount,
        currency: pricing.currency,
        meta: { taxRuleId: taxRule.id },
      });
    }

    const applicablePromotions: any[] = [];
    for (const promo of activePromotions) {
      const promoAmount = pricing.adjustedPrice * input.guestCount;
      if (PromotionPolicy.canApply(promo, promoAmount)) {
        applicablePromotions.push(promo);
      }
    }

    const totalAmount = quoteItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const validUntil = new Date(Date.now() + (input.validHours ?? 24) * 60 * 60 * 1000);

    const quote = await prisma.$transaction(async (tx) => {
      const quoteReference = `QT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const subtotal = quoteItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const created = await tx.quote.create({
        data: {
          quoteReference,
          experienceId: input.experienceId,
          departureId: input.departureId,
          customerCategory: input.customerCategory,
          guestCount: input.guestCount,
          basePrice: pricing.basePrice,
          subtotal,
          totalAmount: totalAmount,
          currency: input.currency ?? "KES",
          validUntil,
          status: "ACTIVE",
          createdBy: actorId,
          metadata: input.metadata as any,
        },
      });

      for (const item of quoteItems) {
        await tx.quoteItem.create({
          data: {
            quoteId: created.id,
            type: item.type,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toString(),
            totalPrice: item.totalPrice.toString(),
            currency: item.currency,
            meta: item.meta,
          },
        });
      }

      return created;
    });

      auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: quote.quoteReference ?? quote.id,
      action: "QUOTE_CREATED",
      details: {
        guestCount: quote.guestCount,
        totalAmount: quote.basePrice,
        experienceId: quote.experienceId,
      },
      actorId: actorId ?? undefined,
    });

    if (quote.quoteReference) {
      (eventBus as any).emit("quote.created", {
        quoteId: quote.id,
        quoteReference: quote.quoteReference,
        experienceId: quote.experienceId,
        customerCategory: quote.customerCategory,
        guestCount: quote.guestCount,
        totalAmount: quote.basePrice.toNumber(),
        currency: quote.currency,
        validUntil: quote.validUntil?.toISOString(),
      } as QuoteCreatedEvent);
    }

    return {
      ...quote,
      basePrice: quote.basePrice.toNumber(),
      items: quoteItems,
      addOns: addOnCharges,
      promotions: applicablePromotions,
      taxes: taxCharges,
    };
  }

  async getQuote(id: string) {
    const quote = await quoteRepository.findByReference(id);
    if (!quote) {
      return quoteRepository.findById(id);
    }
    return quote;
  }

  async convertToBooking(quoteId: string, bookingData: any, actorId?: string): Promise<any> {
    const quote = await this.getQuote(quoteId);
    if (!quote) {
      throw new Error("Quote not found");
    }

    QuotationPolicy.assertCanConvert(quote);

    const updated = await quoteRepository.update(quoteId, {
      status: "CONVERTED",
      convertedToBookingId: bookingData.bookingId,
    } as any);

      auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: quoteId,
      action: "QUOTE_CONVERTED",
      details: { bookingId: bookingData.bookingId },
      actorId: actorId ?? undefined,
    });

    (eventBus as any).emit("quote.converted", {
      quoteId: updated.id,
      quoteReference: updated.quoteReference,
      bookingId: bookingData.bookingId,
    } as QuoteConvertedEvent);

    return updated;
  }

  async expireQuote(quoteId: string): Promise<void> {
    const quote = await this.getQuote(quoteId);
    if (!quote) {
      throw new Error("Quote not found");
    }

    if (!QuotationPolicy.canExpire(quote)) {
      return;
    }

    if (quote.validUntil && new Date() > quote.validUntil) {
      await quoteRepository.updateStatus(quoteId, "EXPIRED");
      (eventBus as any).emit("quote.expired", {
        quoteId: quote.id,
        quoteReference: quote.quoteReference,
      } as QuoteExpiredEvent);
    }
  }

  async cancelQuote(quoteId: string, reason?: string): Promise<void> {
    const quote = await this.getQuote(quoteId);
    if (!quote) {
      throw new Error("Quote not found");
    }

    if (!QuotationPolicy.canExpire(quote)) {
      throw new Error(`Cannot cancel quote: status is ${quote.status}`);
    }

    await quoteRepository.update(quoteId, {
      status: "CANCELLED",
    } as any);

    (eventBus as any).emit("quote.cancelled", {
      quoteId: quote.id,
      quoteReference: quote.quoteReference,
      reason,
    } as QuoteCancelledEvent);
  }

  async processExpiredQuotes(): Promise<number> {
    const expiredQuotes = await prisma.quote.findMany({
      where: {
        status: { in: ["DRAFT", "ACTIVE"] },
        validUntil: { lt: new Date() },
      },
    });

    let count = 0;
    for (const quote of expiredQuotes) {
      await quoteRepository.updateStatus(quote.id, "EXPIRED");
      (eventBus as any).emit("quote.expired", {
        quoteId: quote.id,
        quoteReference: quote.quoteReference,
      } as QuoteExpiredEvent);
      count++;
    }

    return count;
  }
}

export const quotationService = new QuotationService();