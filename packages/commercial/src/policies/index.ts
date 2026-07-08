import { PricingStrategy, PromotionType, CancellationWindow, CommissionType, TaxType } from "../domain/commercial.types";

export class PricingPolicy {
  private static readonly VALID_STRATEGIES: PricingStrategy[] = [
    "FIXED", "SEASONAL", "DYNAMIC", "PARTNER", "CORPORATE",
    "HOTEL", "RESIDENT", "INTERNATIONAL", "PRIVATE_CHARTER", "VIP"
  ];

  static isValidStrategy(strategy: string): boolean {
    return this.VALID_STRATEGIES.includes(strategy as PricingStrategy);
  }

  static assertValidStrategy(strategy: string): void {
    if (!this.isValidStrategy(strategy)) {
      throw new Error(`Invalid pricing strategy: ${strategy}`);
    }
  }

  static isPriceApplicable(priceListItem: any, context: any): boolean {
    if (!priceListItem) {
      return false;
    }
    if (priceListItem.status !== "ACTIVE") {
      return false;
    }
    return true;
  }

  static assertPriceApplicable(priceListItem: any, context: any): void {
    if (!priceListItem) {
      throw new Error("Price list item not found");
    }
    if (priceListItem.status !== "ACTIVE") {
      throw new Error(`Price list item is not active (status: ${priceListItem.status})`);
    }
  }

  static canCalculate(experienceId?: string): boolean {
    return !!experienceId;
  }
}

export class PromotionPolicy {
  private static readonly VALID_TYPES: PromotionType[] = [
    "PERCENTAGE", "FIXED_AMOUNT", "BUY_X_GET_Y", "FREE_ITEM", "BUNDLE"
  ];

  static isValidType(type: string): boolean {
    return this.VALID_TYPES.includes(type as PromotionType);
  }

  static assertValidType(type: string): void {
    if (!this.isValidType(type)) {
      throw new Error(`Invalid promotion type: ${type}`);
    }
  }

  static canApply(promotion: any, bookingAmount: number): boolean {
    return this.isWithinValidityPeriod(promotion) && 
           !this.hasExceededUsage(promotion) &&
           this.meetsMinimumPurchase(promotion, bookingAmount);
  }

  static assertCanApply(promotion: any, bookingAmount: number): void {
    if (!this.isWithinValidityPeriod(promotion)) {
      throw new Error("Promotion is not within validity period");
    }
    if (this.hasExceededUsage(promotion)) {
      throw new Error("Promotion has exceeded maximum usage");
    }
    if (!this.meetsMinimumPurchase(promotion, bookingAmount)) {
      throw new Error(`Booking amount does not meet minimum purchase requirement`);
    }
  }

  static isStackable(code: string, existingPromotions: string[]): boolean {
    return !existingPromotions.includes(code);
  }

  static assertStackable(code: string, existingPromotions: string[]): void {
    if (!this.isStackable(code, existingPromotions)) {
      throw new Error(`Promotion ${code} cannot be stacked with existing promotions`);
    }
  }

  static hasExceededUsage(promotion: any): boolean {
    if (!promotion) {
      return true;
    }
    const maxUsage = promotion.maxUsageCount ?? promotion.maxUsage;
    const currentUsage = promotion.usageCount ?? promotion.currentUsage ?? 0;
    if (maxUsage && currentUsage >= maxUsage) {
      return true;
    }
    return false;
  }

  static assertNotExhausted(promotion: any): void {
    if (this.hasExceededUsage(promotion)) {
      throw new Error(`Promotion ${promotion?.code ?? 'unknown'} has been exhausted`);
    }
  }

  static isWithinValidityPeriod(promotion: any): boolean {
    if (!promotion) {
      return false;
    }
    const now = new Date();
    const validFrom = promotion.effectiveFrom ?? promotion.validFrom ? new Date(promotion.effectiveFrom ?? promotion.validFrom) : null;
    const validTo = promotion.effectiveTo ?? promotion.validTo ? new Date(promotion.effectiveTo ?? promotion.validTo) : null;

    if (validFrom && now < validFrom) {
      return false;
    }
    if (validTo && now > validTo) {
      return false;
    }
    if (promotion.status !== "ACTIVE") {
      return false;
    }
    return true;
  }

  static assertValidPeriod(promotion: any): void {
    if (!promotion) {
      throw new Error("Promotion not found");
    }
    if (!this.isWithinValidityPeriod(promotion)) {
      throw new Error(`Promotion ${promotion.code ?? 'unknown'} is not within validity period or not active`);
    }
  }

  static meetsMinimumPurchase(promotion: any, amount: number): boolean {
    if (!promotion) {
      return false;
    }
    const minPurchase = promotion.minPurchaseAmount ?? promotion.minimumPurchase;
    if (minPurchase && amount < minPurchase) {
      return false;
    }
    return true;
  }
}

export class QuotationPolicy {
  static canCreate(bookingId?: string): boolean {
    return !!bookingId;
  }

  static assertCanCreate(bookingId?: string): void {
    if (!this.canCreate(bookingId)) {
      throw new Error("Cannot create quote: booking ID is required");
    }
  }

  static canConvert(quote: any): boolean {
    return !!quote && quote.status === "ACTIVE";
  }

  static assertCanConvert(quote: any): void {
    if (!quote) {
      throw new Error("Quote not found");
    }
    if (quote.status !== "ACTIVE") {
      throw new Error(`Cannot convert quote: status is ${quote.status}`);
    }
  }

  static canExpire(quote: any): boolean {
    return !!quote && quote.status !== "EXPIRED" && quote.status !== "CONVERTED";
  }

  static isExpired(quote: any): boolean {
    if (!quote) {
      return true;
    }
    return quote.status === "EXPIRED" || quote.status === "CANCELLED";
  }
}

export class ReservationPolicy {
  static canHold(experienceId?: string, departureId?: string): boolean {
    return !!experienceId && !!departureId;
  }

  static assertCanHold(experienceId?: string, departureId?: string): void {
    if (!experienceId) {
      throw new Error("Cannot hold: experience ID is required");
    }
    if (!departureId) {
      throw new Error("Cannot hold: departure ID is required");
    }
  }

  static hasConflict(hold: any, guestCount: number): boolean {
    if (!hold) {
      return false;
    }
    if (hold.availableCapacity !== undefined && hold.availableCapacity < guestCount) {
      return true;
    }
    return false;
  }

  static isValidHoldPeriod(start: Date, end: Date): boolean {
    if (!start || !end) {
      return false;
    }
    const now = new Date();
    const maxHoldDuration = 24 * 60 * 60 * 1000;
    const holdDuration = end.getTime() - start.getTime();
    return start > now && holdDuration <= maxHoldDuration;
  }
}

export class CancellationPolicy {
  private static readonly VALID_WINDOWS: CancellationWindow[] = [
    "FLEXIBLE", "MODERATE", "STRICT", "SUPER_STRICT", "CUSTOM"
  ];

  static isValidWindow(window: string): boolean {
    return this.VALID_WINDOWS.includes(window as CancellationWindow);
  }

  static assertValidWindow(window: string): void {
    if (!this.isValidWindow(window)) {
      throw new Error(`Invalid cancellation window: ${window}`);
    }
  }

  static canProcessRefund(policy: any): boolean {
    if (!policy) {
      return false;
    }
    return policy.allowRefund !== false;
  }
}

export class RefundPolicy {
  static canCalculate(bookingId: string): boolean {
    return !!bookingId;
  }

  static assertCanCalculate(bookingId: string): void {
    if (!this.canCalculate(bookingId)) {
      throw new Error("Cannot calculate refund: booking ID is required");
    }
  }

  static canApprove(refund: any): boolean {
    return !!refund && refund.status === "CALCULATED";
  }

  static assertCanApprove(refund: any): void {
    if (!refund) {
      throw new Error("Refund not found");
    }
    if (refund.status !== "CALCULATED") {
      throw new Error(`Cannot approve refund: status is ${refund.status}`);
    }
  }

  static canExecute(refund: any): boolean {
    if (!refund) {
      return false;
    }
    const refundAmount = Number(refund.refundAmount ?? 0);
    return refund.status === "APPROVED" && refundAmount > 0;
  }

  static assertCanExecute(refund: any): void {
    if (!this.canExecute(refund)) {
      throw new Error("Cannot execute refund: refund must be approved with positive amount");
    }
  }

  static isValidAmount(amount: number, min: number = 0): boolean {
    return amount >= min && amount <= 1000000000;
  }
}

export class CommissionPolicy {
  private static readonly VALID_TYPES: CommissionType[] = [
    "PARTNER", "CORPORATE", "TRAVEL_AGENT", "REFERRAL", "INTERNAL_SALES"
  ];

  static isValidType(type: string): boolean {
    return this.VALID_TYPES.includes(type as CommissionType);
  }

  static assertValidType(type: string): void {
    if (!this.isValidType(type)) {
      throw new Error(`Invalid commission type: ${type}`);
    }
  }

  static canCalculate(rule: any, bookingAmount: number): boolean {
    if (!rule) {
      return false;
    }
    return this.isWithinPeriod(rule) && bookingAmount > 0;
  }

  static isWithinPeriod(rule: any): boolean {
    if (!rule) {
      return false;
    }
    const now = new Date();
    const validFrom = rule.validFrom ? new Date(rule.validFrom) : null;
    const validTo = rule.validTo ? new Date(rule.validTo) : null;

    if (validFrom && now < validFrom) {
      return false;
    }
    if (validTo && now > validTo) {
      return false;
    }
    return true;
  }
}

export class TaxPolicy {
  private static readonly VALID_TYPES: TaxType[] = [
    "VAT", "TOURISM_LEVY", "MARINE_CONSERVATION_FEE", "SERVICE_CHARGE", "COUNTY_TAX"
  ];

  private static readonly VALID_JURISDICTIONS = ["KENYA", "TANZANIA", "UGANDA", "RWANDA", "DEM REP CONGO"];

  static isValidType(type: string): boolean {
    return this.VALID_TYPES.includes(type as TaxType);
  }

  static assertValidType(type: string): void {
    if (!this.isValidType(type)) {
      throw new Error(`Invalid tax type: ${type}`);
    }
  }

  static isValidJurisdiction(jurisdiction: string): boolean {
    return this.VALID_JURISDICTIONS.includes(jurisdiction.toUpperCase());
  }

  static isApplicable(taxRule: any, context: any): boolean {
    if (!taxRule) {
      return false;
    }
    return taxRule.isActive !== false;
  }

  static canCalculate(taxRule: any): boolean {
    return !!taxRule && this.isApplicable(taxRule, null);
  }
}

export class CommercialSummaryPolicy {
  static canGenerate(bookingId?: string, quoteId?: string): boolean {
    return !!bookingId || !!quoteId;
  }

  static assertCanGenerate(bookingId?: string, quoteId?: string): void {
    if (!this.canGenerate(bookingId, quoteId)) {
      throw new Error("Cannot generate commercial summary: booking ID or quote ID is required");
    }
  }

  static canLock(summary: any): boolean {
    return !!summary && summary.status === "FINALIZED";
  }

  static assertCanLock(summary: any): void {
    if (!summary) {
      throw new Error("Commercial summary not found");
    }
    if (summary.status !== "FINALIZED") {
      throw new Error(`Cannot lock summary: status is ${summary.status}`);
    }
  }

  static canAdjust(summary: any): boolean {
    return !!summary && summary.status !== "LOCKED";
  }

  static assertCanAdjust(summary: any): void {
    if (!summary) {
      throw new Error("Commercial summary not found");
    }
    if (summary.status === "LOCKED") {
      throw new Error("Cannot adjust locked commercial summary");
    }
  }
}