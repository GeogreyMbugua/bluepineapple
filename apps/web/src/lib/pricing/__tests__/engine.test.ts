import { describe, it, expect } from 'vitest';
import {
  calculatePricing,
  calculateStopCount,
  getOneWayFare,
  getReturnFare,
  formatKsh,
  validatePricingInput,
} from '../engine';
import { ROUTE_STOPS } from '../constants';
import type { PricingInput } from '../constants';

const STOPS = ROUTE_STOPS;

describe('Pricing Engine', () => {
  describe('calculateStopCount', () => {
    it('calculates correct stop count for adjacent stops', () => {
      expect(calculateStopCount(STOPS[0], STOPS[1])).toBe(1);
    });

    it('calculates correct stop count for full route', () => {
      expect(calculateStopCount(STOPS[0], STOPS[8])).toBe(8);
    });

    it('calculates correct stop count for middle stops', () => {
      expect(calculateStopCount(STOPS[2], STOPS[5])).toBe(3);
    });

    it('never returns less than 1', () => {
      expect(calculateStopCount(STOPS[0], STOPS[0])).toBe(1);
    });
  });

  describe('getOneWayFare', () => {
    it('returns correct fare for each stop count', () => {
      expect(getOneWayFare(1)).toBe(500);
      expect(getOneWayFare(2)).toBe(750);
      expect(getOneWayFare(3)).toBe(1000);
      expect(getOneWayFare(4)).toBe(1400);
      expect(getOneWayFare(5)).toBe(1800);
      expect(getOneWayFare(6)).toBe(2200);
      expect(getOneWayFare(7)).toBe(2600);
      expect(getOneWayFare(8)).toBe(3000);
    });

    it('throws for unsupported stop counts', () => {
      expect(() => getOneWayFare(0)).toThrow('Unsupported stop count: 0');
      expect(() => getOneWayFare(9)).toThrow('Unsupported stop count: 9');
    });
  });

  describe('getReturnFare', () => {
    it('returns correct return fare for each stop count', () => {
      expect(getReturnFare(1)).toBe(900);
      expect(getReturnFare(2)).toBe(1300);
      expect(getReturnFare(3)).toBe(1700);
      expect(getReturnFare(4)).toBe(2300);
      expect(getReturnFare(5)).toBe(2900);
      expect(getReturnFare(6)).toBe(3500);
      expect(getReturnFare(7)).toBe(4100);
      expect(getReturnFare(8)).toBe(5000);
    });

    it('throws for unsupported return stop counts', () => {
      expect(() => getReturnFare(0)).toThrow('Unsupported return stop count: 0');
      expect(() => getReturnFare(9)).toThrow('Unsupported return stop count: 9');
    });
  });

  describe('validatePricingInput', () => {
    it('returns null for valid input', () => {
      expect(validatePricingInput({
        origin: STOPS[0],
        destination: STOPS[1],
        adults: 1,
        children: 0,
        infants: 0,
        returnTicket: false,
      })).toBeNull();
    });

    it('rejects negative passenger counts', () => {
      expect(validatePricingInput({
        origin: STOPS[0],
        destination: STOPS[1],
        adults: -1,
        children: 0,
        infants: 0,
        returnTicket: false,
      })).toEqual({ code: 'NEGATIVE_PASSENGERS', message: 'Passenger counts cannot be negative' });
    });

    it('rejects zero total passengers', () => {
      expect(validatePricingInput({
        origin: STOPS[0],
        destination: STOPS[1],
        adults: 0,
        children: 0,
        infants: 0,
        returnTicket: false,
      })).toEqual({ code: 'NO_PASSENGERS', message: 'At least one passenger is required' });
    });

    it('rejects same origin and destination', () => {
      expect(validatePricingInput({
        origin: STOPS[0],
        destination: STOPS[0],
        adults: 1,
        children: 0,
        infants: 0,
        returnTicket: false,
      })).toEqual({ code: 'SAME_ORIGIN_DESTINATION', message: 'Origin and destination cannot be the same' });
    });

    it('rejects destination before origin', () => {
      expect(validatePricingInput({
        origin: STOPS[5],
        destination: STOPS[2],
        adults: 1,
        children: 0,
        infants: 0,
        returnTicket: false,
      })).toEqual({ code: 'DESTINATION_BEFORE_ORIGIN', message: 'Destination must come after origin' });
    });
  });

  describe('One-way pricing', () => {
    const baseInput: PricingInput = {
      origin: STOPS[0],
      destination: STOPS[1],
      adults: 1,
      children: 0,
      infants: 0,
      returnTicket: false,
    };

    it('calculates 1 stop fare correctly', () => {
      const result = calculatePricing({ ...baseInput, destination: STOPS[1] });
      expect(result.stopCount).toBe(1);
      expect(result.oneWayAdultFare).toBe(500);
      expect(result.total).toBe(500);
    });

    it('calculates 3 stops fare correctly', () => {
      const result = calculatePricing({ ...baseInput, destination: STOPS[3] });
      expect(result.stopCount).toBe(3);
      expect(result.oneWayAdultFare).toBe(1000);
      expect(result.total).toBe(1000);
    });

    it('calculates full route (8 stops) fare correctly', () => {
      const result = calculatePricing({ ...baseInput, destination: STOPS[8] });
      expect(result.stopCount).toBe(8);
      expect(result.oneWayAdultFare).toBe(3000);
      expect(result.total).toBe(3000);
    });

    it('calculates child fare as 50% of adult fare', () => {
      const result = calculatePricing({ ...baseInput, destination: STOPS[3], adults: 1, children: 1 });
      expect(result.oneWayChildFare).toBe(500);
      expect(result.childSubtotal).toBe(500);
      expect(result.subtotal).toBe(1500);
    });

    it('calculates infant fare as free', () => {
      const result = calculatePricing({ ...baseInput, destination: STOPS[3], adults: 1, infants: 1 });
      expect(result.oneWayInfantFare).toBe(0);
      expect(result.infantSubtotal).toBe(0);
      expect(result.subtotal).toBe(1000);
    });
  });

  describe('Return pricing', () => {
    const baseInput: PricingInput = {
      origin: STOPS[0],
      destination: STOPS[1],
      adults: 1,
      children: 0,
      infants: 0,
      returnTicket: true,
    };

    it('calculates return fare using official return table, not 1.8x multiplier', () => {
      const result = calculatePricing({ ...baseInput, destination: STOPS[1] });
      expect(result.returnAdultFare).toBe(900);
      expect(result.total).toBe(900);
    });

    it('calculates return fare for 3 stops', () => {
      const result = calculatePricing({ ...baseInput, destination: STOPS[3] });
      expect(result.stopCount).toBe(3);
      expect(result.returnAdultFare).toBe(1700);
      expect(result.total).toBe(1700);
    });

    it('calculates return fare for full route', () => {
      const result = calculatePricing({ ...baseInput, destination: STOPS[8] });
      expect(result.stopCount).toBe(8);
      expect(result.returnAdultFare).toBe(5000);
      expect(result.total).toBe(5000);
    });

    it('calculates return child fare as 50% of return adult fare', () => {
      const result = calculatePricing({ ...baseInput, destination: STOPS[3], adults: 1, children: 1 });
      expect(result.returnChildFare).toBe(850);
      expect(result.childSubtotal).toBe(850);
      expect(result.total).toBe(2550);
    });
  });

  describe('Discounts', () => {
    it('applies 10% couple discount for exactly 2 adults, 0 children, 0 infants', () => {
      const result = calculatePricing({
        origin: STOPS[0],
        destination: STOPS[3],
        adults: 2,
        children: 0,
        infants: 0,
        returnTicket: false,
      });
      expect(result.discountRate).toBe(0.1);
      expect(result.appliedDiscounts).toContain('10% off couple bookings');
      expect(result.subtotal).toBe(2000);
      expect(result.discountedTotal).toBe(1800);
    });

    it('does not apply couple discount when children are present', () => {
      const result = calculatePricing({
        origin: STOPS[0],
        destination: STOPS[3],
        adults: 2,
        children: 1,
        infants: 0,
        returnTicket: false,
      });
      expect(result.discountRate).toBe(0);
      expect(result.appliedDiscounts).toHaveLength(0);
    });

    it('applies 20% group discount for 4+ total passengers', () => {
      const result = calculatePricing({
        origin: STOPS[0],
        destination: STOPS[3],
        adults: 2,
        children: 2,
        infants: 0,
        returnTicket: false,
      });
      expect(result.discountRate).toBe(0.2);
      expect(result.appliedDiscounts).toContain('20% off group/family bookings (4+ paying passengers)');
    });

    it('does not apply group discount for 3 passengers', () => {
      const result = calculatePricing({
        origin: STOPS[0],
        destination: STOPS[3],
        adults: 2,
        children: 1,
        infants: 0,
        returnTicket: false,
      });
      expect(result.discountRate).toBe(0);
    });

    it('does not stack couple and group when couple conditions are not met', () => {
      const result = calculatePricing({
        origin: STOPS[0],
        destination: STOPS[3],
        adults: 2,
        children: 2,
        infants: 0,
        returnTicket: false,
      });
      expect(result.discountRate).toBe(0.2);
      expect(result.appliedDiscounts).toHaveLength(1);
    });

    it('caps discount rate at 100%', () => {
      const customRule = {
        name: 'free',
        description: '100% off',
        rate: 1,
        applies: () => true,
      };
      const result = calculatePricing({
        origin: STOPS[0],
        destination: STOPS[3],
        adults: 1,
        children: 0,
        infants: 0,
        returnTicket: false,
        discountRules: [customRule],
      });
      expect(result.discountRate).toBe(1);
      expect(result.total).toBe(0);
    });
  });

  describe('Return ticket with discounts', () => {
    it('applies discount to return fare directly', () => {
      const result = calculatePricing({
        origin: STOPS[0],
        destination: STOPS[3],
        adults: 2,
        children: 0,
        infants: 0,
        returnTicket: true,
      });
      const returnAdultFare = 1700;
      const subtotal = returnAdultFare * 2;
      const discounted = Math.round(subtotal * 0.9);
      expect(result.discountedTotal).toBe(discounted);
      expect(result.total).toBe(discounted);
    });
  });

  describe('All stop combinations', () => {
    it('produces deterministic output for all valid stop pairs', () => {
      for (let i = 0; i < STOPS.length; i++) {
        for (let j = i + 1; j < STOPS.length; j++) {
          const result = calculatePricing({
            origin: STOPS[i],
            destination: STOPS[j],
            adults: 1,
            children: 0,
            infants: 0,
            returnTicket: false,
          });
          expect(result.stopCount).toBe(j - i);
          expect(result.total).toBeGreaterThan(0);
          expect(result.currency).toBe('KES');
        }
      }
    });
  });

  describe('formatKsh', () => {
    it('formats currency correctly', () => {
      expect(formatKsh(500)).toBe('Ksh 500');
      expect(formatKsh(1000)).toBe('Ksh 1,000');
      expect(formatKsh(3500)).toBe('Ksh 3,500');
    });
  });

  describe('Regression: existing behavior preserved', () => {
    it('matches original calculateBooking for 1 stop, 1 adult, no return', () => {
      const result = calculatePricing({
        origin: STOPS[0],
        destination: STOPS[1],
        adults: 1,
        children: 0,
        infants: 0,
        returnTicket: false,
      });
      expect(result.total).toBe(500);
    });

    it('matches original calculateBooking for 3 stops, 2 adults, return', () => {
      const result = calculatePricing({
        origin: STOPS[0],
        destination: STOPS[3],
        adults: 2,
        children: 0,
        infants: 0,
        returnTicket: true,
      });
      const returnAdultFare = 1700;
      const subtotal = returnAdultFare * 2;
      const discounted = Math.round(subtotal * 0.9);
      expect(result.total).toBe(discounted);
    });

    it('matches original calculateBooking for child pricing', () => {
      const result = calculatePricing({
        origin: STOPS[0],
        destination: STOPS[3],
        adults: 1,
        children: 1,
        infants: 0,
        returnTicket: false,
      });
      expect(result.oneWayChildFare).toBe(500);
      expect(result.total).toBe(1500);
    });
  });
});
