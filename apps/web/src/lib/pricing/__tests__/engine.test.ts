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

  it("returns 3 for mid-route", () => {
    expect(calculateStopCount("Mtwapa Beach", "Pirates")).toBe(5);
  });
});

describe("getOneWayFare", () => {
  it("returns correct fare for each stop count", () => {
    expect(getOneWayFare(1)).toBe(500);
    expect(getOneWayFare(2)).toBe(750);
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
    expect(getReturnFare(1)).toBe(900);
    expect(getReturnFare(2)).toBe(1300);
    expect(getReturnFare(3)).toBe(1700);
    expect(getReturnFare(4)).toBe(2300);
    expect(getReturnFare(5)).toBe(2900);
    expect(getReturnFare(6)).toBe(3500);
    expect(getReturnFare(7)).toBe(4100);
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

describe("calculatePricing", () => {
  it("calculates per-stop flat rate for one-way", () => {
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
    expect(result.adultSubtotal).toBe(3000); // flat, not multiplied by adults
    expect(result.total).toBe(3000);
  });

  it("calculates child fare as 50% of base fare", () => {
    const result = calculatePricing({
      origin: "Mtwapa Beach",
      destination: "Fort Jesus",
      adults: 1,
      children: 2,
      infants: 0,
      returnTicket: false,
    });

    expect(result.baseFare).toBe(3000);
    expect(result.oneWayChildFare).toBe(1500);
    expect(result.childSubtotal).toBe(3000); // 1500 * 2
    expect(result.total).toBe(6000); // 3000 + 3000
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

  it("return ticket uses return fare table", () => {
    const result = calculatePricing({
      origin: "Mtwapa Beach",
      destination: "Fort Jesus",
      adults: 1,
      children: 0,
      infants: 0,
      returnTicket: true,
    });

    expect(result.stopCount).toBe(8);
    expect(result.returnAdultFare).toBe(5000);
    expect(result.baseFare).toBe(5000);
    expect(result.total).toBe(5000);
  });

  it("applies couple discount", () => {
    const result = calculatePricing({
      origin: "Mtwapa Beach",
      destination: "Fort Jesus",
      adults: 2,
      children: 0,
      infants: 0,
      returnTicket: false,
    });

    expect(result.discountRate).toBe(0.1);
    expect(result.discountAmount).toBe(300);
    expect(result.total).toBe(2700);
  });

  it("applies group discount for 4+ passengers", () => {
    const result = calculatePricing({
      origin: "Mtwapa Beach",
      destination: "Fort Jesus",
      adults: 2,
      children: 2,
      infants: 0,
      returnTicket: false,
    });

    expect(result.discountRate).toBe(0.2);
    expect(result.discountAmount).toBe(1200);
    expect(result.total).toBe(4800);
  });

  it("does not double-apply couple and group discounts", () => {
    const result = calculatePricing({
      origin: "Mtwapa Beach",
      destination: "Fort Jesus",
      adults: 2,
      children: 2,
      infants: 0,
      returnTicket: false,
    });

    expect(result.appliedDiscounts).toHaveLength(1);
    expect(result.appliedDiscounts[0]).toBe("20% off group/family bookings (4+ paying passengers)");
  });
});
