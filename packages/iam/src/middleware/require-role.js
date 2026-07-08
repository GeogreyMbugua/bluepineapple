import { authorizeRequest } from "./authorize";
/**
 * Shorthand helper to assert that the authenticated user has a specific role.
 */
export async function requireRole(req, role) {
    await authorizeRequest(req, { roles: [role] });
}
/**
 * Shorthand helper to assert that the authenticated user has any of the specified roles.
 */
export async function requireAnyRole(req, roles) {
    await authorizeRequest(req, { roles });
}
