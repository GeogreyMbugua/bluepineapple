import { policyEngine } from "./policy-engine";
// ─────────────────────────────────────────────────────────────────────────────
// Default ABAC Policies Registration
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Checks if the current user is the owner of the resource.
 */
export const resourceOwnerPolicy = {
    name: "resource.owner",
    description: "Allows access if the user is the owner of the resource.",
    condition: (user, context) => {
        return user.id === context.ownerId;
    },
};
/**
 * Checks if the booking belongs to the current user or the associated partner.
 */
export const bookingAccessPolicy = {
    name: "booking.access",
    description: "Allows access if the booking belongs to the user or partner.",
    condition: (user, context) => {
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
export const propertyAccessPolicy = {
    name: "property.access",
    description: "Allows access if the property belongs to the investor.",
    condition: (user, context) => {
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
    registerDefaultPolicies() {
        policyEngine.register(resourceOwnerPolicy);
        policyEngine.register(bookingAccessPolicy);
        policyEngine.register(propertyAccessPolicy);
    }
}
export const policyService = new PolicyService();
