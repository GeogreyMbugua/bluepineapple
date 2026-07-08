/**
 * RBAC module public surface.
 *
 * Import from this barrel when consuming RBAC definitions:
 *   import { ROLES, PERMISSIONS, ROLE_PERMISSIONS } from "@blue-pineapple/shared/rbac";
 *   import type { Role, Permission } from "@blue-pineapple/shared/rbac";
 */
export * from "./roles";
export * from "./permissions";
export * from "./role-permissions";
