import type { AuthenticatedRequest } from "./authenticate";
import type { Role } from "../types/roles";
import { authorizeRequest } from "./authorize";

/**
 * Shorthand helper to assert that the authenticated user has a specific role.
 */
export async function requireRole(req: AuthenticatedRequest, role: Role): Promise<void> {
  await authorizeRequest(req, { roles: [role] });
}

/**
 * Shorthand helper to assert that the authenticated user has any of the specified roles.
 */
export async function requireAnyRole(req: AuthenticatedRequest, roles: readonly Role[]): Promise<void> {
  await authorizeRequest(req, { roles });
}
