export type PricingStrategy = 
  | "FIXED"
  | "SEASONAL"
  | "DYNAMIC"
  | "PARTNER"
  | "CORPORATE"
  | "HOTEL"
  | "RESIDENT"
  | "INTERNATIONAL"
  | "PRIVATE_CHARTER"
  | "VIP";

export type PriceStatus = "DRAFT" | "ACTIVE" | "EXPIRED" | "ARCHIVED";
export type PromotionType = "PERCENTAGE" | "FIXED_AMOUNT" | "BUY_X_GET_Y" | "FREE_ITEM" | "BUNDLE";
export type PromotionStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED" | "DEPLETED";
export type QuoteStatus = "DRAFT" | "ACTIVE" | "CONVERTED" | "EXPIRED" | "CANCELLED";
export type HoldStatus = "ACTIVE" | "EXPIRED" | "CONVERTED" | "RELEASED";
export type CancellationWindow = "FLEXIBLE" | "MODERATE" | "STRICT" | "SUPER_STRICT" | "CUSTOM";
export type RefundStatus = "PENDING" | "CALCULATED" | "APPROVED" | "EXECUTED" | "FAILED";
export type CommissionType = "PARTNER" | "CORPORATE" | "TRAVEL_AGENT" | "REFERRAL" | "INTERNAL_SALES";
export type TaxType = "VAT" | "TOURISM_LEVY" | "MARINE_CONSERVATION_FEE" | "SERVICE_CHARGE" | "COUNTY_TAX";
export type AddOnCategory = "TRANSPORT" | "CATERING" | "EXPERIENCE" | "SERVICE" | "INSURANCE" | "MERCHANDISE";
export type RuleType = 
  | "SEASON"
  | "HOLIDAY"
  | "WEEKEND"
  | "TIME_OF_DAY"
  | "GROUP_SIZE"
  | "CUSTOMER_CATEGORY"
  | "CUSTOMER_TYPE"
  | "EXPERIENCE"
  | "ROUTE"
  | "DEPARTURE_TIME"
  | "VESSEL_CLASS"
  | "PROMOTIONAL_PERIOD"
  | "MIN_STAY"
  | "ADVANCE_BOOKING"
  | "CUSTOM";

export interface PricingContext {
  experienceId?: string;
  departureId?: string;
  routeId?: string;
  customerCategory?: string;
  customerType?: string;
  ageGroup?: string;
  groupSize?: number;
  bookingDate?: Date;
  departureDate?: Date;
  vesselClass?: string;
  channel?: string;
  partnerId?: string;
  corporateId?: string;
  isInternational?: boolean;
  isResident?: boolean;
  isVIP?: boolean;
  currency?: string;
}

export interface PricingResult {
  basePrice: number;
  adjustedPrice: number;
  currency: string;
  rulesApplied: AppliedRule[];
  breakdown: PriceBreakdown;
}

export interface AppliedRule {
  ruleId: string;
  ruleName: string;
  ruleType: string;
  adjustmentType: "MULTIPLIER" | "ADDITIVE" | "SET";
  value: number;
  description: string;
}

export interface PriceBreakdown {
  base: number;
  seasonalAdjustment: number;
  groupSizeAdjustment: number;
  customerCategoryAdjustment: number;
  partnerAdjustment: number;
  dynamicAdjustment: number;
  totalAdjustments: number;
  finalPrice: number;
}

export interface PromotionApplication {
  promotionId: string;
  promotionCode: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  appliedAmount: number;
  maxDiscountAmount?: number;
  appliedToAmount: number;
  description: string;
}

export interface PromotionValidationResult {
  isValid: boolean;
  reason?: string;
  promotion?: {
    id: string;
    name: string;
    code: string;
    type: string;
    discountValue: number;
    isPercentage: boolean;
    maxDiscountAmount?: number;
  };
}

export interface QuoteSnapshot {
  basePrice: number;
  addOns: AddOnCharge[];
  subtotal: number;
  promotions: PromotionApplication[];
  totalDiscount: number;
  taxes: TaxCharge[];
  totalTax: number;
  subtotalAfterDiscount: number;
  totalAmount: number;
  currency: string;
}

export interface AddOnCharge {
  addOnId: string;
  addOnName: string;
  price: number;
  quantity: number;
  total: number;
  isPerPerson: boolean;
  category: string;
}

export interface TaxCharge {
  taxRuleId: string;
  taxName: string;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
  isInclusive: boolean;
  jurisdiction: string;
}

export interface CommissionBreakdown {
  ruleId: string;
  ruleName: string;
  type: string;
  rate: number;
  baseAmount: number;
  commissionAmount: number;
  currency: string;
}

export interface RefundBreakdown {
  baseAmount: number;
  penaltyAmount: number;
  administrativeFee: number;
  subtotal: number;
  refundAmount: number;
  currency: string;
}

export interface CancellationResult {
  policyId: string;
  policyName: string;
  hoursBefore: number;
  refundPercentage: number;
  penaltyAmount: number;
  administrativeFee: number;
  refundAmount: number;
  currency: string;
}

export type CommercialSummaryStatus = "PENDING" | "FINALIZED" | "LOCKED" | "ADJUSTED";
