/**
 * Canonical RBAC permission key definitions.
 *
 * This is the single source of truth for all permission keys in the Blue
 * Pineapple platform. All consumers — database seeds, IAM types, policy
 * engines — must import from here. Do not duplicate these definitions elsewhere.
 */
export const PERMISSIONS = [
    // Users
    "user.read",
    "user.manage",
    // Partners
    "partner.read",
    "partner.create",
    "partner.update",
    "partner.delete",
    // Bookings
    "booking.read",
    "booking.create",
    "booking.update",
    "booking.cancel",
    "booking.manage",
    // Experiences
    "experience.read",
    "experience.create",
    "experience.update",
    "experience.delete",
    "experience.manage",
    // Rewards
    "reward.read",
    "reward.manage",
    // Payments
    "payment.read",
    "payment.manage",
    "payment.refund",
    // Properties
    "property.read",
    "property.manage",
    // Investments
    "investment.read",
    "investment.manage",
];
