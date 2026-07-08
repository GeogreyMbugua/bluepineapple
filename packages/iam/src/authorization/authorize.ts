import type { AuthUser } from "../types/auth-user";
import type { Role } from "../types/roles";
import type { Permission } from "../types/permissions";
import { hasAnyRole, hasAllRoles } from "./has-role";
import { hasAnyPermission, hasAllPermissions } from "./has-permission";
import { ForbiddenError } from "./errors";


// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Options for building an authorization guard.
 *
 * Semantics:
 *   - `roles` and `permissions` are each evaluated independently.
 *   - When both are specified, BOTH constraints must be satisfied (AND logic).
 *   - Within each constraint, `requireAll: false` (default) uses OR logic
 *     (any one item passes), while `requireAll: true` uses AND logic (all
 *     items must be present).
 *   - Omitting both `roles` and `permissions` produces a deny-all guard
 *     (fail-secure default).
 */
export interface AuthorizeOptions {
  /**
   * Role names to check. The user must have at least one (or all, if
   * requireAll is true).
   */
  roles?: readonly Role[];

  /**
   * Permission keys to check. The user must have at least one (or all, if
   * requireAll is true).
   */
  permissions?: readonly Permission[];

  /**
   * When true, ALL items within each list must be present.
   * When false (default), ANY item within each list is sufficient.
   */
  requireAll?: boolean;
}

/** A compiled authorization guard. Call with an AuthUser to evaluate access. */
export type AuthGuard = (user: AuthUser) => boolean;

// ─────────────────────────────────────────────────────────────────────────────
// Core factory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a reusable authorization guard from the given options.
 *
 * The returned guard is a pure function — no side effects, no I/O.
 * Compose it with middleware or call it directly in services.
 *
 * @example — require ADMIN role
 *   const guard = authorize({ roles: ["ADMIN"] });
 *   if (!guard(user)) throw new ForbiddenError();
 *
 * @example — require a specific permission
 *   const guard = authorize({ permissions: ["partner.create"] });
 *
 * @example — require role AND permission together
 *   const guard = authorize({
 *     roles: ["PARTNER"],
 *     permissions: ["booking.create"],
 *   });
 *
 * @example — require all listed permissions
 *   const guard = authorize({
 *     permissions: ["payment.read", "payment.manage"],
 *     requireAll: true,
 *   });
 */
export function authorize(options: AuthorizeOptions): AuthGuard {
  const { roles = [], permissions = [], requireAll = false } = options;

  // Fail-secure: empty constraints deny all.
  if (roles.length === 0 && permissions.length === 0) {
    return () => false;
  }

  return (user: AuthUser): boolean => {
    // Evaluate role constraint (true if no roles specified)
    const rolesPassed: boolean =
      roles.length === 0
        ? true
        : requireAll
          ? hasAllRoles(user, roles)
          : hasAnyRole(user, roles);

    // Evaluate permission constraint (true if no permissions specified)
    const permissionsPassed: boolean =
      permissions.length === 0
        ? true
        : requireAll
          ? hasAllPermissions(user, permissions)
          : hasAnyPermission(user, permissions);

    // Both constraints must be satisfied when both are specified.
    return rolesPassed && permissionsPassed;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Immediately evaluates authorization options against a user.
 * Shorthand for `authorize(options)(user)`.
 *
 * @example
 * const allowed = check(user, { roles: ["ADMIN"] });
 */
export function check(user: AuthUser, options: AuthorizeOptions): boolean {
  return authorize(options)(user);
}

/**
 * Asserts that the user passes the authorization check.
 * Throws ForbiddenError if the check fails.
 *
 * @example
 * assertAuthorized(user, { permissions: ["partner.create"] });
 * // safe to proceed — user is authorized
 */
export function assertAuthorized(
  user: AuthUser,
  options: AuthorizeOptions,
): void {
  if (!check(user, options)) {
    throw new ForbiddenError();
  }
}

