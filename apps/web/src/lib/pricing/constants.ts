export const ROUTE_STOPS = [
  "Mtwapa Beach",
  "Serena",
  "Whitesands",
  "Bamburi",
  "Pirates",
  "Mombasa Beach",
  "Nyali",
  "English Point",
  "Fort Jesus",
] as const;

export type Stop = (typeof ROUTE_STOPS)[number];

export const STOP_POSITIONS: Record<Stop, number> = {
  "Mtwapa Beach": 0,
  Serena: 1,
  Whitesands: 2,
  Bamburi: 3,
  Pirates: 4,
  "Mombasa Beach": 5,
  Nyali: 6,
  "English Point": 7,
  "Fort Jesus": 8,
};

export const ONE_WAY_FARES: Record<number, number> = {
  1: 500,
  2: 700,
  3: 1000,
  4: 1400,
  5: 1800,
  6: 2200,
  7: 2600,
  8: 3000,
};

export const RETURN_FARES: Record<number, number> = {
  1: 800,
  2: 1200,
  3: 1500,
  4: 1900,
  5: 2300,
  6: 2700,
  7: 3100,
  8: 5000,
};

export const CHILD_DISCOUNT_RATE = 0.5;
export const INFANT_AGE_MAX = 4;
export const CHILD_AGE_MIN = 5;
export const CHILD_AGE_MAX = 15;

export interface DiscountRule {
  readonly name: string;
  readonly description: string;
  readonly rate: number;
  readonly applies: (context: DiscountContext) => boolean;
}

export interface DiscountContext {
  readonly adults: number;
  readonly children: number;
  readonly infants: number;
  readonly totalPassengers: number;
}

export const COUPLE_DISCOUNT: DiscountRule = {
  name: "couple",
  description: "10% off couple bookings",
  rate: 0.1,
  applies: (ctx) => ctx.adults === 2 && ctx.children === 0 && ctx.infants === 0,
};

export const GROUP_DISCOUNT: DiscountRule = {
  name: "group",
  description: "20% off group/family bookings (4+ paying passengers)",
  rate: 0.2,
  applies: (ctx) => ctx.totalPassengers >= 4,
};

export const DEFAULT_DISCOUNT_RULES: readonly DiscountRule[] = [COUPLE_DISCOUNT, GROUP_DISCOUNT];

export interface PricingInput {
  readonly origin: Stop;
  readonly destination: Stop;
  readonly adults: number;
  readonly children: number;
  readonly infants: number;
  readonly returnTicket: boolean;
  readonly discountRules?: readonly DiscountRule[];
  readonly applyDiscounts?: boolean;
}

export interface PricingBreakdown {
  readonly origin: Stop;
  readonly destination: Stop;
  readonly stopCount: number;
  readonly oneWayAdultFare: number;
  readonly oneWayChildFare: number;
  readonly oneWayInfantFare: number;
  readonly returnAdultFare: number;
  readonly returnChildFare: number;
  readonly returnInfantFare: number;
  readonly baseFare: number;
  readonly adultSubtotal: number;
  readonly childSubtotal: number;
  readonly infantSubtotal: number;
  readonly subtotal: number;
  readonly discountRate: number;
  readonly discountAmount: number;
  readonly discountedTotal: number;
  readonly returnMultiplier: number;
  readonly returnSurcharge: number;
  readonly total: number;
  readonly appliedDiscounts: readonly string[];
  readonly currency: string;
}

export type PricingError =
  | { code: "INVALID_STOP"; message: string }
  | { code: "SAME_ORIGIN_DESTINATION"; message: string }
  | { code: "DESTINATION_BEFORE_ORIGIN"; message: string }
  | { code: "NO_PASSENGERS"; message: string }
  | { code: "NEGATIVE_PASSENGERS"; message: string }
  | { code: "UNSUPPORTED_STOP_COUNT"; message: string };
