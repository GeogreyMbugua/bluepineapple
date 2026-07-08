import { z } from "zod";

export const PricingStrategySchema = z.enum([
  "FIXED",
  "SEASONAL",
  "DYNAMIC",
  "PARTNER",
  "CORPORATE",
  "HOTEL",
  "RESIDENT",
  "INTERNATIONAL",
  "PRIVATE_CHARTER",
  "VIP",
]);

export const PriceStatusSchema = z.enum(["DRAFT", "ACTIVE", "EXPIRED", "ARCHIVED"]);

export type PriceStatus = z.infer<typeof PriceStatusSchema>;

export const PriceStatusValueSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "EXPIRED",
  "ARCHIVED",
]);

export const PromotionTypeSchema = z.enum([
  "PERCENTAGE",
  "FIXED_AMOUNT",
  "BUY_X_GET_Y",
  "FREE_ITEM",
  "BUNDLE",
]);

export const PromotionStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "EXPIRED",
  "DEPLETED",
]);

export const PromotionStackabilitySchema = z.enum([
  "STACKABLE",
  "NON_STACKABLE",
]);

export const QuoteStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "CONVERTED",
  "EXPIRED",
  "CANCELLED",
]);

export const HoldStatusSchema = z.enum([
  "ACTIVE",
  "EXPIRED",
  "CONVERTED",
  "RELEASED",
]);

export const CancellationWindowSchema = z.enum([
  "FLEXIBLE",
  "MODERATE",
  "STRICT",
  "SUPER_STRICT",
  "CUSTOM",
]);

export const RefundStatusSchema = z.enum([
  "PENDING",
  "CALCULATED",
  "APPROVED",
  "EXECUTED",
  "FAILED",
]);

export const CommissionTypeSchema = z.enum([
  "PARTNER",
  "CORPORATE",
  "TRAVEL_AGENT",
  "REFERRAL",
  "INTERNAL_SALES",
]);

export const TaxTypeSchema = z.enum([
  "VAT",
  "TOURISM_LEVY",
  "MARINE_CONSERVATION_FEE",
  "SERVICE_CHARGE",
  "COUNTY_TAX",
]);

export const TaxJurisdictionSchema = z.enum([
  "KENYA",
  "INTERNATIONAL",
  "CUSTOM",
]);

export const AddOnCategorySchema = z.enum([
  "TRANSPORT",
  "CATERING",
  "EXPERIENCE",
  "SERVICE",
  "INSURANCE",
  "MERCHANDISE",
]);

export const RuleTypeSchema = z.enum([
  "SEASON",
  "HOLIDAY",
  "WEEKEND",
  "TIME_OF_DAY",
  "GROUP_SIZE",
  "CUSTOMER_CATEGORY",
  "CUSTOMER_TYPE",
  "EXPERIENCE",
  "ROUTE",
  "DEPARTURE_TIME",
  "VESSEL_CLASS",
  "PROMOTIONAL_PERIOD",
  "MIN_STAY",
  "ADVANCE_BOOKING",
  "CUSTOM",
]);

export const CreatePriceListSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  experienceId: z.string().uuid().optional().nullable(),
  status: PriceStatusSchema.default("DRAFT"),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional().nullable(),
  priority: z.number().int().min(0).default(0),
  currency: z.string().length(3).default("KES"),
  createdBy: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
  items: z
    .array(
      z.object({
        name: z.string().min(1).max(200),
        description: z.string().max(2000).optional(),
        basePrice: z.number().positive(),
        currency: z.string().length(3).default("KES"),
        customerCategory: z.string().optional(),
        ageGroup: z.string().optional(),
        minGuests: z.number().int().min(1).optional(),
        maxGuests: z.number().int().min(1).optional(),
        seatClass: z.string().optional(),
        meta: z.record(z.string(), z.any()).optional(),
      })
    )
    .min(1),
});

export const UpdatePriceListSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: PriceStatusSchema.optional(),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional().nullable(),
  priority: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const CreatePricingRuleSchema = z.object({
  priceListId: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  ruleType: RuleTypeSchema,
  conditions: z.record(z.string(), z.any()),
  priority: z.number().int().min(0).default(0),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional().nullable(),
  createdBy: z.string().uuid().optional().nullable(),
});

export const CreateSeasonSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  recurring: z.boolean().default(false),
});

export const CreatePromotionSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50).transform((v) => v.toUpperCase()),
  description: z.string().max(2000).optional(),
  type: PromotionTypeSchema,
  stackability: PromotionStackabilitySchema.default("NON_STACKABLE"),
  discountValue: z.number().positive(),
  isPercentage: z.boolean().default(true),
  maxDiscountAmount: z.number().positive().optional().nullable(),
  minPurchaseAmount: z.number().positive().optional().nullable(),
  maxUsageCount: z.number().int().min(1).optional().nullable(),
  perUserLimit: z.number().int().min(1).optional().nullable(),
  applicableTo: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date(),
  createdBy: z.string().uuid().optional().nullable(),
  rules: z
    .array(
      z.object({
        ruleType: RuleTypeSchema,
        conditions: z.record(z.string(), z.any()),
        priority: z.number().int().min(0).default(0),
        isActive: z.boolean().default(true),
      })
    )
    .optional(),
});

export const UpdatePromotionSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: PromotionStatusSchema.optional(),
  stackability: PromotionStackabilitySchema.optional(),
  discountValue: z.number().positive().optional(),
  isPercentage: z.boolean().optional(),
  maxDiscountAmount: z.number().positive().optional().nullable(),
  minPurchaseAmount: z.number().positive().optional().nullable(),
  maxUsageCount: z.number().int().min(1).optional().nullable(),
  perUserLimit: z.number().int().min(1).optional().nullable(),
  applicableTo: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional(),
});

export const ValidatePromotionSchema = z.object({
  code: z.string().min(1).max(50),
  bookingAmount: z.number().positive(),
  customerCategory: z.string().optional(),
  customerType: z.string().optional(),
  experienceId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  partnerId: z.string().uuid().optional(),
  guestId: z.string().uuid().optional(),
});

export const CreateQuoteSchema = z.object({
  experienceId: z.string().uuid().optional().nullable(),
  departureId: z.string().uuid().optional().nullable(),
  customerCategory: z.string().optional(),
  guestCount: z.number().int().min(1),
  basePrice: z.number().nonnegative(),
  currency: z.string().length(3).default("KES"),
  validHours: z.number().int().min(1).max(168).default(24),
  addOns: z
    .array(
      z.object({
        addOnId: z.string().uuid(),
        quantity: z.number().int().min(1).default(1),
      })
    )
    .optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  createdBy: z.string().uuid().optional().nullable(),
});

export const CreateReservationHoldSchema = z.object({
  experienceId: z.string().uuid().optional().nullable(),
  departureId: z.string().uuid().optional().nullable(),
  date: z.coerce.date().optional().nullable(),
  guestCount: z.number().int().min(1),
  holdMinutes: z.number().int().min(5).max(1440).default(20),
  metadata: z.record(z.string(), z.any()).optional(),
  createdBy: z.string().uuid().optional().nullable(),
});

export const CreateCancellationPolicySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  experienceId: z.string().uuid().optional().nullable(),
  partnerId: z.string().uuid().optional().nullable(),
  corporateId: z.string().uuid().optional().nullable(),
  windowType: CancellationWindowSchema,
  hoursBefore: z.number().int().min(0),
  refundPercentage: z.number().min(0).max(100),
  penaltyAmount: z.number().nonnegative().optional().nullable(),
  penaltyType: z.enum(["PERCENTAGE", "FIXED"]).default("PERCENTAGE"),
  administrativeFee: z.number().nonnegative().optional().nullable(),
  allowRefund: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  priority: z.number().int().min(0).default(0),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional().nullable(),
});

export const CreateTaxRuleSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  type: TaxTypeSchema,
  jurisdiction: TaxJurisdictionSchema,
  rate: z.number().nonnegative(),
  isPercentage: z.boolean().default(true),
  isInclusive: z.boolean().default(false),
  appliesTo: z.record(z.string(), z.any()).optional(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional().nullable(),
  priority: z.number().int().min(0).default(0),
  isDefault: z.boolean().default(false),
});

export const CreateCommissionRuleSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  type: CommissionTypeSchema,
  rate: z.number().nonnegative(),
  isPercentage: z.boolean().default(true),
  fixedAmount: z.number().nonnegative().optional().nullable(),
  appliesTo: z.record(z.string(), z.any()).optional(),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional().nullable(),
  priority: z.number().int().min(0).default(0),
  isDefault: z.boolean().default(false),
});

export const CreateAddOnSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: AddOnCategorySchema,
  experienceId: z.string().uuid().optional().nullable(),
  isPerPerson: z.boolean().default(true),
  metadata: z.record(z.string(), z.any()).optional(),
  prices: z
    .array(
      z.object({
        name: z.string().min(1).max(200),
        description: z.string().max(2000).optional(),
        price: z.number().nonnegative(),
        currency: z.string().length(3).default("KES"),
        effectiveFrom: z.coerce.date(),
        effectiveTo: z.coerce.date().optional().nullable(),
        priority: z.number().int().min(0).default(0),
        isActive: z.boolean().default(true),
      })
    )
    .min(1),
});

export const PricingContextSchema = z.object({
  experienceId: z.string().uuid().optional().nullable(),
  departureId: z.string().uuid().optional().nullable(),
  routeId: z.string().uuid().optional().nullable(),
  customerCategory: z.string().optional().nullable(),
  customerType: z.string().optional().nullable(),
  ageGroup: z.string().optional().nullable(),
  groupSize: z.number().int().min(1).optional(),
  bookingDate: z.coerce.date().optional().nullable(),
  departureDate: z.coerce.date().optional().nullable(),
  vesselClass: z.string().optional().nullable(),
  channel: z.string().optional().nullable(),
  partnerId: z.string().uuid().optional().nullable(),
  corporateId: z.string().uuid().optional().nullable(),
  isInternational: z.boolean().optional(),
  isResident: z.boolean().optional(),
  isVIP: z.boolean().optional(),
  currency: z.string().length(3).default("KES"),
});

export const CalculatePriceSchema = z.object({
  experienceId: z.string().uuid(),
  pricingContext: PricingContextSchema,
});

export const CalculateRefundSchema = z.object({
  bookingId: z.string().uuid(),
  originalAmount: z.number().positive(),
  cancellationHours: z.number().nonnegative(),
  currency: z.string().length(3).default("KES"),
});
