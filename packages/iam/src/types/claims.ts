import type { Role } from "./roles";
import type { Permission } from "./permissions";

/**
 * JwtClaims — the shape of the custom claims embedded in a Blue Pineapple claims payload.
 *
 * - `sub`         : User ID (standard JWT subject)
 * - `sessionId`   : Session identifier for the current session
 * - `roles`       : Assigned role names from the canonical Role union
 * - `permissions` : Resolved permission keys from the canonical Permission union
 * - `userType`    : Derived classification for the user
 * - `email`       : Optional verified email address
 * - `phone`       : Optional verified phone number
 */
export interface JwtClaims {
  sub: string;
  sessionId: string;

  roles: Role[];
  permissions: Permission[];

  userType: string;

  email?: string | undefined;
  phone?: string | undefined;
}
