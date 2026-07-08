import type { Role } from "./roles";
import type { Permission } from "./permissions";

/**
 * Canonical role → permission mapping.
 *
 * This is the single source of truth for all role-permission assignments in
 * the Blue Pineapple platform. Use "*" to denote wildcard (all permissions).
 *
 * All consumers — database seeds, IAM policy engines, authorization middleware
 * — must import from here. Do not duplicate this mapping elsewhere.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly ["*"] | readonly Permission[]> = {
  SUPER_ADMIN: ["*"],

  ADMIN: [
    "user.read",
    "user.manage",

    "partner.read",
    "partner.create",
    "partner.update",

    "booking.read",
    "booking.create",
    "booking.update",
    "booking.manage",

    "experience.read",
    "experience.create",
    "experience.update",
    "experience.manage",

    "reward.read",
    "reward.manage",
  ],

  PARTNER: [
    "booking.read",
    "booking.create",

    "experience.read",

    "reward.read",
  ],

  INVESTOR: [
    "property.read",
    "investment.read",
  ],

  FINANCE_MANAGER: [
    "payment.read",
    "payment.manage",
    "payment.refund",

    "reward.read",
    "reward.manage",
  ],

  GUEST: [],
} as const;
