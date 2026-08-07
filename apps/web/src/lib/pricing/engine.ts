import {
  ROUTE_STOPS,
  ONE_WAY_FARES,
  RETURN_FARES,
  CHILD_DISCOUNT_RATE,
  DEFAULT_DISCOUNT_RULES,
  type Stop,
  type DiscountRule,
  type DiscountContext,
  type PricingInput,
  type PricingBreakdown,
  type PricingError,
} from "./constants";

export function validatePricingInput(input: PricingInput): PricingError | null {
  const { origin, destination, adults, children, infants } = input;

  if (adults < 0 || children < 0 || infants < 0) {
    return { code: "NEGATIVE_PASSENGERS", message: "Passenger counts cannot be negative" };
  }

  if (adults === 0 && children === 0 && infants === 0) {
    return { code: "NO_PASSENGERS", message: "At least one passenger is required" };
  }

  const originIndex = ROUTE_STOPS.indexOf(origin);
  const destinationIndex = ROUTE_STOPS.indexOf(destination);

  if (originIndex === -1) {
    return { code: "INVALID_STOP", message: `Invalid origin stop: ${origin}` };
  }
  if (destinationIndex === -1) {
    return { code: "INVALID_STOP", message: `Invalid destination stop: ${destination}` };
  }

  if (originIndex === destinationIndex) {
    return { code: "SAME_ORIGIN_DESTINATION", message: "Origin and destination cannot be the same" };
  }

  if (destinationIndex < originIndex) {
    return { code: "DESTINATION_BEFORE_ORIGIN", message: "Destination must come after origin" };
  }

  return null;
}

export function calculateStopCount(origin: Stop, destination: Stop): number {
  const originIndex = ROUTE_STOPS.indexOf(origin);
  const destinationIndex = ROUTE_STOPS.indexOf(destination);
  return Math.max(1, destinationIndex - originIndex);
}

export function getOneWayFare(stopCount: number): number {
  const fare = ONE_WAY_FARES[stopCount];
  if (fare === undefined) {
    throw new Error(`Unsupported stop count: ${stopCount}. Valid range: 1-${Object.keys(ONE_WAY_FARES).length}`);
  }
  return fare;
}

export function getReturnFare(stopCount: number): number {
  const fare = RETURN_FARES[stopCount];
  if (fare === undefined) {
    throw new Error(`Unsupported return stop count: ${stopCount}. Valid range: 1-${Object.keys(RETURN_FARES).length}`);
  }
  return fare;
}

export function calculatePassengerFares(
  oneWayFare: number,
  returnFare: number,
  adults: number,
  children: number,
  infants: number,
  returnTicket: boolean
): {
  baseFare: number;
  adultSubtotal: number;
  childSubtotal: number;
  infantSubtotal: number;
} {
  // Base fare is per stop, per paying guest.
  // Children pay 50% of the base fare each.
  // Infants travel free.
  const baseFare = returnTicket ? returnFare : oneWayFare;
  const childFare = Math.round(baseFare * CHILD_DISCOUNT_RATE);

  const adultSubtotal = baseFare * adults;
  const childSubtotal = childFare * children;
  const infantSubtotal = 0;

  return {
    baseFare,
    adultSubtotal,
    childSubtotal,
    infantSubtotal,
  };
}

export function calculateDiscount(
  adults: number,
  children: number,
  infants: number,
  rules: readonly DiscountRule[] = DEFAULT_DISCOUNT_RULES
): { rate: number; amount: number; appliedDiscounts: string[] } {
  const context: DiscountContext = {
    adults,
    children,
    infants,
    totalPassengers: adults + children + infants,
  };

  let totalRate = 0;
  const applied: string[] = [];

  for (const rule of rules) {
    if (rule.applies(context)) {
      totalRate += rule.rate;
      applied.push(rule.description);
    }
  }

  return {
    rate: Math.min(totalRate, 1),
    amount: 0,
    appliedDiscounts: applied,
  };
}

export function calculatePricing(input: PricingInput): PricingBreakdown {
  const error = validatePricingInput(input);
  if (error) {
    throw new Error(`${error.code}: ${error.message}`);
  }

  const {
    origin,
    destination,
    adults,
    children,
    infants,
    returnTicket,
    discountRules,
    applyDiscounts = true,
  } = input;

  const stopCount = calculateStopCount(origin, destination);
  const oneWayFare = getOneWayFare(stopCount);
  const returnFare = getReturnFare(stopCount);

  const { baseFare, adultSubtotal, childSubtotal, infantSubtotal } = calculatePassengerFares(
    oneWayFare,
    returnFare,
    adults,
    children,
    infants,
    returnTicket
  );

  const subtotal = adultSubtotal + childSubtotal + infantSubtotal;
  const discount = applyDiscounts
    ? calculateDiscount(adults, children, infants, discountRules)
    : { rate: 0, amount: 0, appliedDiscounts: [] as string[] };
  const discountAmount = Math.round(subtotal * discount.rate);
  const discountedTotal = subtotal - discountAmount;
  const total = discountedTotal;

  return {
    origin,
    destination,
    stopCount,
    oneWayAdultFare: oneWayFare,
    oneWayChildFare: Math.round(oneWayFare * CHILD_DISCOUNT_RATE),
    oneWayInfantFare: 0,
    returnAdultFare: returnFare,
    returnChildFare: Math.round(returnFare * CHILD_DISCOUNT_RATE),
    returnInfantFare: 0,
    baseFare,
    adultSubtotal,
    childSubtotal,
    infantSubtotal,
    subtotal,
    discountRate: discount.rate,
    discountAmount,
    discountedTotal,
    returnMultiplier: 1,
    returnSurcharge: 0,
    total,
    appliedDiscounts: discount.appliedDiscounts,
    currency: "KES",
  };
}

export function formatKsh(value: number): string {
  return `Ksh ${value.toLocaleString("en-US")}`;
}
