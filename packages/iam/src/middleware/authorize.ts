import type { AuthenticatedRequest } from "./authenticate";
import { type AuthorizeOptions } from "../authorization/authorize";
import { UnauthorizedError } from "../authorization/errors";
import { accessControlService } from "../authorization/access-control.service";
import type { PolicyContext } from "../authorization/policy-engine";

/**
 * Higher-order helper to authorize a request context based on roles,
 * permissions, or ABAC policies.
 *
 * Throws UnauthorizedError if request is not authenticated.
 * Throws ForbiddenError if request user does not have sufficient permissions.
 */
export async function authorizeRequest(
  req: AuthenticatedRequest,
  options: AuthorizeOptions & { policyName?: string; policyContext?: PolicyContext }
): Promise<void> {
  const user = req.user;
  if (!user) {
    throw new UnauthorizedError("User is not authenticated on this request.");
  }

  await accessControlService.assertAuthorized(user, options);
}

/**
 * Creates a middleware-like function that asserts the request is authorized.
 */
export function guardRequest(
  options: AuthorizeOptions & { policyName?: string; policyContext?: PolicyContext }
) {
  return async (req: AuthenticatedRequest): Promise<void> => {
    await authorizeRequest(req, options);
  };
}
