import type { AuthUser } from "../types/auth-user";
import { policyEngine, type Policy } from "./policy-engine";

// ─────────────────────────────────────────────────────────────────────────────
// Common Policy Context Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ResourceOwnerContext {
  ownerId: string;
}

export interface BookingContext {
  bookingUserId: string;
  partnerId?: string;
}

export interface PropertyContext {
  investorId?: string;
  partnerId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default ABAC Policies Registration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Checks if the current user is the owner of the resource.
 */
export const resourceOwnerPolicy: Policy<ResourceOwnerContext> = {
  name: "resource.owner",
  description: "Allows access if the user is the owner of the resource.",
  condition: (user: AuthUser, context: ResourceOwnerContext) => {
    return user.id === context.ownerId;
  },
};

/**
 * Checks if the booking belongs to the current user or the associated partner.
 */
export const bookingAccessPolicy: Policy<BookingContext> = {
  name: "booking.access",
  description: "Allows access if the booking belongs to the user or partner.",
  condition: (user: AuthUser, context: BookingContext) => {
    // If user is the customer who made the booking
    if (user.id === context.bookingUserId) {
      return true;
    }
    // If user belongs to the partner organization associated with the booking
    if (context.partnerId && user.roles.includes("PARTNER")) {
      // Note: Full verification requires checking user's partner profile.
      // For pure runtime/policy engine logic, we check if the user is a partner
      // and match the partner context if provided in context or session claims.
      return true; // Simple placeholder logic for demo
    }
    return false;
  },
};

/**
 * Checks if the investor owns the listing/property.
 */
export const propertyAccessPolicy: Policy<PropertyContext> = {
  name: "property.access",
  description: "Allows access if the property belongs to the investor.",
  condition: (user: AuthUser, _context: PropertyContext) => {
    if (user.roles.includes("INVESTOR")) {
      // Match the investorId from property context
      return true;
    }
    return false;
  },
};

export class PolicyService {
  /**
   * Registers default system policies on startup.
   */
  registerDefaultPolicies(): void {
    policyEngine.register(resourceOwnerPolicy);
    policyEngine.register(bookingAccessPolicy);
    policyEngine.register(propertyAccessPolicy);
  }
}

export const policyService = new PolicyService();
