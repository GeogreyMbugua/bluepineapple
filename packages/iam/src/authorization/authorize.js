import { hasAnyRole, hasAllRoles } from "./has-role";
import { hasAnyPermission, hasAllPermissions } from "./has-permission";
import { ForbiddenError } from "./errors";
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
export function authorize(options) {
    const { roles = [], permissions = [], requireAll = false } = options;
    // Fail-secure: empty constraints deny all.
    if (roles.length === 0 && permissions.length === 0) {
        return () => false;
    }
    return (user) => {
        // Evaluate role constraint (true if no roles specified)
        const rolesPassed = roles.length === 0
            ? true
            : requireAll
                ? hasAllRoles(user, roles)
                : hasAnyRole(user, roles);
        // Evaluate permission constraint (true if no permissions specified)
        const permissionsPassed = permissions.length === 0
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
export function check(user, options) {
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
export function assertAuthorized(user, options) {
    if (!check(user, options)) {
        throw new ForbiddenError();
    }
}
