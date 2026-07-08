export interface PricingCalculatedEvent {
  experienceId?: string;
  context: any;
  basePrice: number;
  adjustedPrice: number;
  currency: string;
  rulesApplied: any[];
}

export interface PromotionValidatedEvent {
  code: string;
  bookingId?: string;
  isValid: boolean;
  reason?: string;
}

export interface PromotionAppliedEvent {
  code: string;
  bookingId?: string;
  discountAmount: number;
  currency: string;
}

export interface PromotionRejectedEvent {
  code: string;
  reason: string;
}

export interface QuoteCreatedEvent {
  quoteId: string;
  quoteReference: string;
  experienceId?: string;
  customerCategory?: string;
  guestCount: number;
  totalAmount: number;
  currency: string;
  validUntil: string;
}

export interface QuoteExpiredEvent {
  quoteId: string;
  quoteReference: string;
}

export interface QuoteConvertedEvent {
  quoteId: string;
  quoteReference: string;
  bookingId: string;
}

export interface QuoteCancelledEvent {
  quoteId: string;
  quoteReference: string;
  reason?: string;
}

export interface ReservationHoldCreatedEvent {
  holdId: string;
  holdReference: string;
  experienceId?: string;
  guestCount: number;
  expiresAt: string;
}

export interface ReservationHoldExpiredEvent {
  holdId: string;
  holdReference: string;
}

export interface ReservationHoldConvertedEvent {
  holdId: string;
  holdReference: string;
  bookingId?: string;
  quoteId?: string;
}

export interface ReservationHoldReleasedEvent {
  holdId: string;
  holdReference: string;
}

export interface PriceListActivatedEvent {
  priceListId: string;
  priceListName: string;
  priority: number;
}

export interface PriceListExpiredEvent {
  priceListId: string;
  priceListName: string;
}

export interface PricingRuleCreatedEvent {
  ruleId: string;
  ruleName: string;
  ruleType: string;
}

export interface PricingRuleUpdatedEvent {
  ruleId: string;
  ruleName: string;
}

export interface PromotionCreatedEvent {
  promotionId: string;
  promotionName: string;
  code: string;
}

export interface PromotionStatusChangedEvent {
  promotionId: string;
  oldStatus: string;
  newStatus: string;
}

export interface CommercialSummaryGeneratedEvent {
  summaryId: string;
  summaryReference: string;
  bookingId?: string;
  totalAmount: number;
  currency: string;
}

export interface CommercialSummaryConfirmedEvent {
  summaryId: string;
  summaryReference: string;
  bookingId?: string;
}

export interface TaxRuleActivatedEvent {
  taxRuleId: string;
  taxName: string;
  type: string;
  jurisdiction: string;
}

export interface TaxCalculatedEvent {
  taxCalculationId: string;
  bookingId?: string;
  taxAmount: number;
  currency: string;
}

export interface CommissionCalculatedEvent {
  commissionCalculationId: string;
  partnerId?: string;
  commissionAmount: number;
  currency: string;
  type: string;
}

export interface CommissionPaidEvent {
  commissionCalculationId: string;
  partnerId?: string;
  commissionAmount: number;
  currency: string;
}

export interface RefundCalculatedEvent {
  refundCalculationId: string;
  bookingId: string;
  refundAmount: number;
  currency: string;
}

export interface RefundApprovedEvent {
  refundCalculationId: string;
  bookingId: string;
  refundAmount: number;
  currency: string;
}

export interface RefundExecutedEvent {
  refundCalculationId: string;
  bookingId: string;
  refundAmount: number;
  currency: string;
}

export interface CancellationPolicyAppliedEvent {
  bookingId: string;
  policyId: string;
  refundAmount: number;
  currency: string;
}

export interface CancellationPolicyCreatedEvent {
  policyId: string;
  policyName: string;
  windowType: string;
}

export interface RefundFailedEvent {
  refundCalculationId: string;
  bookingId: string;
  reason: string;
}

export interface AddOnCreatedEvent {
  addOnId: string;
  addOnName: string;
  category: string;
}

export interface DiscountAppliedEvent {
  bookingId?: string;
  quoteId?: string;
  discountAmount: number;
  currency: string;
  appliedBy: string;
}