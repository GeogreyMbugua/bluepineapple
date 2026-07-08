import type { Role as SharedRole } from "@blue-pineapple/shared/rbac";

/**
 * Role — a union of all valid role name strings.
 * Derived from the canonical ROLES array in @blue-pineapple/shared.
 * Do not add role strings here — edit packages/shared/src/rbac/roles.ts.
 */
export type Role = SharedRole;
