import type { Permission as SharedPermission } from "@blue-pineapple/shared/rbac";

/**
 * Permission — a union of all valid permission key strings.
 * Derived from the canonical PERMISSIONS array in @blue-pineapple/shared.
 * Do not add permission strings here — edit packages/shared/src/rbac/permissions.ts.
 */
export type Permission = SharedPermission;
