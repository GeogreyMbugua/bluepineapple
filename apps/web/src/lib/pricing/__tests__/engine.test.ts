import { describe, it, expect } from "vitest";
import {
  calculatePricing,
  calculateStopCount,
  getOneWayFare,
  getReturnFare,
  validatePricingInput,
} from "../engine";

describe("calculateStopCount", () => {
  it("returns 1 for adjacent stops", () => {
    expect(calculateStopCount("Mtwapa Beach", "Serena")).toBe(1);
  });

  it("returns 8 for full route", () => {
    expect(calculateStopCount("Mtwapa Beach", "Fort Jesus")).toBe(8);
  });

  it("returns 4 for mid-route", () => {
    expect(calculateStopCount("Mtwapa Beach", "Pirates")).toBe(4);
  });

  it("follows the canonical Bamburi-before-Whitesands route order", () => {
    expect(calculateStopCount("Serena", "Bamburi")).toBe(1);
    expect(calculateStopCount("Serena", "Whitesands")).toBe(2);
    expect(calculateStopCount("Bamburi", "Whitesands")).toBe(1);
  });
});

describe("getOneWayFare", () => {
  it("returns correct fare for each stop count", () => {
    expect(getOneWayFare(1)).toBe(500);
    expect(getOneWayFare(2)).toBe(700);
    expect(getOneWayFare(3)).toBe(1000);
    expect(getOneWayFare(4)).toBe(1400);
    expect(getOneWayFare(5)).toBe(1800);
    expect(getOneWayFare(6)).toBe(2200);
    expect(getOneWayFare(7)).toBe(2600);
    expect(getOneWayFare(8)).toBe(3000);
  });
});

describe("getReturnFare", () => {
  it("returns correct fare for each stop count", () => {
    expect(getReturnFare(1)).toBe(800);
    expect(getReturnFare(2)).toBe(1200);
    expect(getReturnFare(3)).toBe(1500);
    expect(getReturnFare(4)).toBe(1900);
    expect(getReturnFare(5)).toBe(2300);
    expect(getReturnFare(6)).toBe(2700);
    expect(getReturnFare(7)).toBe(3100);
    expect(getReturnFare(8)).toBe(5000);
  });
});

describe("validatePricingInput", () => {
  it("returns null for valid input", () => {
    expect(validatePricingInput({
      origin: "Mtwapa Beach",
      destination: "Fort Jesus",
      adults: 2,
      children: 0,
      infants: 0,
      returnTicket: false,
    })).toBeNull();
  });

  it("rejects same origin and destination", () => {
    const error = validatePricingInput({
      origin: "Mtwapa Beach",
      destination: "Mtwapa Beach",
      adults: 1,
      children: 0,
      infants: 0,
      returnTicket: false,
    });
    expect(error?.code).toBe("SAME_ORIGIN_DESTINATION");
  });

  it("rejects destination before origin", () => {
    const error = validatePricingInput({
      origin: "Serena",
      destination: "Mtwapa Beach",
      adults: 1,
      children: 0,
      infants: 0,
      returnTicket: false,
    });
    expect(error?.code).toBe("DESTINATION_BEFORE_ORIGIN");
  });
});

describe("calculatePricing - public bookings (discounts enabled)", () => {
  it("applies couple discount for 2 adults", () => {
    const result = calculatePricing({
      origin: "Mtwapa Beach",
      destination: "Fort Jesus",
      adults: 2,
      children: 0,
      infants: 0,
      returnTicket: false,
      applyDiscounts: true,
    });

    expect(result.subtotal).toBe(6000); // 3000 * 2
    expect(result.discountRate).toBe(0.1);
    expect(result.discountAmount).toBe(600);
    expect(result.total).toBe(5400);
  });

  it("applies group discount to the adult subtotal for 4+ adults", () => {
    const result = calculatePricing({
      origin: "Mtwapa Beach",
      destination: "Fort Jesus",
      adults: 4,
      children: 2,
      infants: 0,
      returnTicket: false,
      applyDiscounts: true,
    });

    expect(result.adultSubtotal).toBe(12000);
    expect(result.childSubtotal).toBe(5700); // 2850 * 2
    expect(result.subtotal).toBe(17700);
    expect(result.discountRate).toBe(0.2);
    expect(result.discountAmount).toBe(2400); // 20% of adult subtotal
    expect(result.total).toBe(15300);
  });

  it("does not double-apply couple and group discounts", () => {
    const result = calculatePricing({
      origin: "Mtwapa Beach",
      destination: "Fort Jesus",
      adults: 4,
      children: 2,
      infants: 0,
      returnTicket: false,
      applyDiscounts: true,
    });

    expect(result.appliedDiscounts).toHaveLength(1);
    expect(result.appliedDiscounts[0]).toBe("20% off group/family bookings (4+ adults)");
  });

  it("does not apply group discount below four adults", () => {
    const result = calculatePricing({
      origin: "Mtwapa Beach",
      destination: "Fort Jesus",
      adults: 3,
      children: 0,
      infants: 1,
      returnTicket: false,
      applyDiscounts: true,
    });

    expect(result.discountRate).toBe(0);
    expect(result.total).toBe(9000);
  });

  it("applies group discount when there are at least four adults", () => {
    const result = calculatePricing({
      origin: "Mtwapa Beach",
      destination: "Fort Jesus",
      adults: 4,
      children: 0,
      infants: 0,
      returnTicket: false,
    });

    expect(result.discountRate).toBe(0.2);
    expect(result.discountAmount).toBe(2400);
    expect(result.total).toBe(9600);
  });
});

describe("calculatePricing - partner bookings (no discounts)", () => {
  it("does not apply couple discount when applyDiscounts is false", () => {
    const result = calculatePricing({
      origin: "Mtwapa Beach",
      destination: "Fort Jesus",
      adults: 2,
      children: 0,
      infants: 0,
      returnTicket: false,
      applyDiscounts: false,
    });

    expect(result.subtotal).toBe(6000); // 3000 * 2
    expect(result.discountRate).toBe(0);
    expect(result.discountAmount).toBe(0);
    expect(result.total).toBe(6000);
    expect(result.appliedDiscounts).toHaveLength(0);
  });

  it("does not apply group discount when applyDiscounts is false", () => {
    const result = calculatePricing({
      origin: "Mtwapa Beach",
      destination: "Fort Jesus",
      adults: 2,
      children: 2,
      infants: 0,
      returnTicket: false,
      applyDiscounts: false,
    });

    expect(result.subtotal).toBe(11700); // 3000*2 + 2850*2
    expect(result.discountRate).toBe(0);
    expect(result.discountAmount).toBe(0);
    expect(result.total).toBe(11700);
    expect(result.appliedDiscounts).toHaveLength(0);
  });

  it("still applies child pricing for partner bookings", () => {
    const result = calculatePricing({
      origin: "Mtwapa Beach",
      destination: "Fort Jesus",
      adults: 1,
      children: 2,
      infants: 0,
      returnTicket: false,
      applyDiscounts: false,
    });

    expect(result.baseFare).toBe(3000);
    expect(result.oneWayChildFare).toBe(2850);
    expect(result.adultSubtotal).toBe(3000);
    expect(result.childSubtotal).toBe(5700); // 2850 * 2
    expect(result.total).toBe(8700);
  });
});

describe("calculatePricing - base scenarios", () => {
  it("multiplies one-way base fare by adult count", () => {
    const result = calculatePricing({
      origin: "Mtwapa Beach",
      destination: "Fort Jesus",
      adults: 3,
      children: 0,
      infants: 0,
      returnTicket: false,
    });

    expect(result.stopCount).toBe(8);
    expect(result.baseFare).toBe(3000);
    expect(result.adultSubtotal).toBe(9000); // 3000 * 3
    expect(result.total).toBe(9000);
  });

  it("infants are free", () => {
    const result = calculatePricing({
      origin: "Mtwapa Beach",
      destination: "Fort Jesus",
      adults: 1,
      children: 0,
      infants: 2,
      returnTicket: false,
    });

    expect(result.infantSubtotal).toBe(0);
    expect(result.total).toBe(3000);
  });

  it("charges children 95% of the applicable fare", () => {
    const result = calculatePricing({
      origin: "Mtwapa Beach",
      destination: "Fort Jesus",
      adults: 1,
      children: 1,
      infants: 0,
      returnTicket: true,
      applyDiscounts: false,
    });

    expect(result.returnAdultFare).toBe(5000);
    expect(result.returnChildFare).toBe(4750);
    expect(result.childSubtotal).toBe(4750);
    expect(result.total).toBe(9750);
  });

  it("return ticket uses return fare table and multiplies by guests", () => {
    const result = calculatePricing({
      origin: "Mtwapa Beach",
      destination: "Fort Jesus",
      adults: 2,
      children: 0,
      infants: 0,
      returnTicket: true,
    });

    expect(result.stopCount).toBe(8);
    expect(result.returnAdultFare).toBe(5000);
    expect(result.baseFare).toBe(5000);
    expect(result.adultSubtotal).toBe(10000); // 5000 * 2
    expect(result.discountRate).toBe(0.1);
    expect(result.discountAmount).toBe(1000);
    expect(result.total).toBe(9000);
  });
});
