import type { AuthUser } from "../types/auth-user";
import type { Role } from "../types/roles";

/**
 * Returns true if the user has been assigned the given role.
 *
 * @example
 * if (!hasRole(user, "ADMIN")) throw new ForbiddenError();
 */
export function hasRole(user: AuthUser, role: Role): boolean {
  return user.roles.includes(role);
}

/**
 * Returns true if the user has at least one of the given roles.
 *
 * @example
 * if (!hasAnyRole(user, ["ADMIN", "SUPER_ADMIN"])) throw new ForbiddenError();
 */
export function hasAnyRole(user: AuthUser, roles: readonly Role[]): boolean {
  return roles.some((role) => user.roles.includes(role));
}

/**
 * Returns true if the user has every one of the given roles.
 *
 * @example
 * if (!hasAllRoles(user, ["PARTNER", "FINANCE_MANAGER"])) throw new ForbiddenError();
 */
export function hasAllRoles(user: AuthUser, roles: readonly Role[]): boolean {
  return roles.every((role) => user.roles.includes(role));
}

/**
 * Returns true if the user is a SUPER_ADMIN.
 * Convenience shorthand for the most privileged role check.
 */
export function isSuperAdmin(user: AuthUser): boolean {
  return hasRole(user, "SUPER_ADMIN");
}
