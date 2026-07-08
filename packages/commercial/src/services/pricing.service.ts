import { prisma, bookingRepository, priceListRepository, priceListItemRepository, pricingRuleRepository, taxRuleRepository, commissionRuleRepository, addOnRepository, addOnPriceRepository, seasonRepository } from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";
import type { PricingResult, AppliedRule } from "../domain/commercial.types";
import type {
  PricingCalculatedEvent,
  PriceListActivatedEvent,
  PriceListExpiredEvent,
  AddOnCreatedEvent,
} from "../events/commercial.events";
import { PricingPolicy } from "../policies";

export class PricingService {
  async findPriceListForContext(context: any): Promise<any> {
    if (!context?.experienceId) {
      return priceListRepository.findActiveGlobal();
    }
    const experiencePriceList = await priceListRepository.findActiveByExperience(context.experienceId);
    if (experiencePriceList) {
      return experiencePriceList;
    }
    return priceListRepository.findActiveGlobal();
  }

  async findAddOnsForContext(context: any): Promise<any[]> {
    return addOnRepository.findActive(context?.experienceId);
  }

  async findActiveRules(context: any): Promise<any[]> {
    const priceList = await this.findPriceListForContext(context);
    const priceListRules = priceList?.rules ?? [];
    const globalRules = await pricingRuleRepository.findActiveGlobal();
    return [...priceListRules, ...globalRules];
  }

  async findActiveTaxRules(context: any): Promise<any[]> {
    const jurisdiction = context?.jurisdiction;
    return taxRuleRepository.findActive(jurisdiction);
  }

  async findActiveCommissionRules(type: string): Promise<any[]> {
    return commissionRuleRepository.findActive(type);
  }

  evaluateRuleConditions(conditions: any, context: any): boolean {
    if (!conditions || typeof conditions !== "object") {
      return true;
    }
    for (const [key, rawValue] of Object.entries(conditions)) {
      const value = rawValue as string | number | boolean;
      if (key === "adjustmentType" || key === "value" || key === "description") {
        continue;
      }
      if (key === "customerCategory" && context?.customerCategory !== value) return false;
      if (key === "customerType" && context?.customerType !== value) return false;
      if (key === "ageGroup" && context?.ageGroup !== value) return false;
      if (key === "experienceId" && context?.experienceId !== value) return false;
      if (key === "routeId" && context?.routeId !== value) return false;
      if (key === "vesselClass" && context?.vesselClass !== value) return false;
      if (key === "isInternational" && context?.isInternational !== value) return false;
      if (key === "isResident" && context?.isResident !== value) return false;
      if (key === "isVIP" && context?.isVIP !== value) return false;
      if (key === "minGroupSize" && (!context?.groupSize || context.groupSize < value)) return false;
      if (key === "maxGroupSize" && (!context?.groupSize || context.groupSize > value)) return false;
    }
    return true;
  }

  applyAdjustment(currentPrice: number, rule: any): number {
    const adjustmentType = rule.conditions?.adjustmentType ?? rule.adjustmentType ?? "ADDITIVE";
    const adjustmentValue = rule.conditions?.value ?? rule.adjustmentValue ?? rule.value ?? 0;
    const value = typeof adjustmentValue === "number" ? adjustmentValue : parseFloat(adjustmentValue);

    if (adjustmentType === "MULTIPLIER") {
      return currentPrice * value;
    }
    if (adjustmentType === "SET") {
      return value;
    }
    return currentPrice + value;
  }

  async calculatePrice(experienceId: string, context: any): Promise<PricingResult> {
    if (!PricingPolicy.canCalculate(experienceId)) {
      throw new Error("Experience ID is required to calculate price");
    }

    const priceList = await this.findPriceListForContext({ ...context, experienceId });
    if (!priceList) {
      throw new Error("No active price list found for context");
    }

    const items = priceList.items ?? [];
    const matchedItem = items.find((item: any) => {
      if (item.customerCategory && item.customerCategory !== context?.customerCategory) return false;
      if (item.ageGroup && item.ageGroup !== context?.ageGroup) return false;
      if (item.seatClass && item.seatClass !== context?.seatClass) return false;
      if (item.minGuests && context?.groupSize && context.groupSize < item.minGuests) return false;
      if (item.maxGuests && context?.groupSize && context.groupSize > item.maxGuests) return false;
      return true;
    }) ?? items[0];

    if (!matchedItem) {
      throw new Error("No matching price list item found");
    }

    PricingPolicy.assertPriceApplicable(matchedItem, context);

    let currentPrice = matchedItem.basePrice?.toNumber?.() ?? matchedItem.basePrice ?? 0;
    const basePrice = currentPrice;
    const rules = await this.findActiveRules({ ...context, experienceId });
    const activeRules = Array.isArray(rules) ? rules : [];

    const appliedRules: AppliedRule[] = [];
    for (const rule of activeRules) {
      if (this.evaluateRuleConditions(rule.conditions ?? {}, context)) {
        currentPrice = this.applyAdjustment(currentPrice, rule);
        appliedRules.push({
          ruleId: rule.id,
          ruleName: rule.name,
          ruleType: rule.ruleType,
          adjustmentType: rule.conditions?.adjustmentType ?? rule.adjustmentType ?? "ADDITIVE",
          value: rule.conditions?.value ?? rule.adjustmentValue ?? 0,
          description: rule.description ?? `Applied ${rule.ruleType} rule`,
        });
      }
    }

    const result: PricingResult = {
      basePrice,
      adjustedPrice: currentPrice,
      currency: matchedItem.currency ?? priceList.currency ?? "KES",
      rulesApplied: appliedRules,
      breakdown: {
        base: basePrice,
        seasonalAdjustment: 0,
        groupSizeAdjustment: 0,
        customerCategoryAdjustment: 0,
        partnerAdjustment: 0,
        dynamicAdjustment: 0,
        totalAdjustments: currentPrice - basePrice,
        finalPrice: currentPrice,
      },
    };

    (eventBus as any).emit("pricing.calculated", {
      experienceId,
      context,
      basePrice: result.basePrice,
      adjustedPrice: result.adjustedPrice,
      currency: result.currency,
      rulesApplied: result.rulesApplied,
    } as PricingCalculatedEvent);

    return result;
  }

  async finalizeBookingPrice(bookingId: string, pricingResult: PricingResult, actorId?: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await bookingRepository.update(bookingId, {
        totalAmount: pricingResult.adjustedPrice.toFixed(2),
        currency: pricingResult.currency,
      } as any);
    });

      auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: bookingId,
      action: "PRICE_FINALIZED",
      details: {
        basePrice: pricingResult.basePrice,
        adjustedPrice: pricingResult.adjustedPrice,
        currency: pricingResult.currency,
        rulesApplied: pricingResult.rulesApplied,
      },
      actorId: actorId ?? undefined,
    });

    (eventBus as any).emit("booking.price.finalized", {
      bookingId,
      basePrice: pricingResult.basePrice,
      adjustedPrice: pricingResult.adjustedPrice,
      currency: pricingResult.currency,
      rulesApplied: pricingResult.rulesApplied,
    });
  }
}

export const pricingService = new PricingService();
