/**
 * Returns true if the user has been assigned the given role.
 *
 * @example
 * if (!hasRole(user, "ADMIN")) throw new ForbiddenError();
 */
export function hasRole(user, role) {
    return user.roles.includes(role);
}
/**
 * Returns true if the user has at least one of the given roles.
 *
 * @example
 * if (!hasAnyRole(user, ["ADMIN", "SUPER_ADMIN"])) throw new ForbiddenError();
 */
export function hasAnyRole(user, roles) {
    return roles.some((role) => user.roles.includes(role));
}
/**
 * Returns true if the user has every one of the given roles.
 *
 * @example
 * if (!hasAllRoles(user, ["PARTNER", "FINANCE_MANAGER"])) throw new ForbiddenError();
 */
export function hasAllRoles(user, roles) {
    return roles.every((role) => user.roles.includes(role));
}
/**
 * Returns true if the user is a SUPER_ADMIN.
 * Convenience shorthand for the most privileged role check.
 */
export function isSuperAdmin(user) {
    return hasRole(user, "SUPER_ADMIN");
}
