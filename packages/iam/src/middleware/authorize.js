import { UnauthorizedError } from "../authorization/errors";
import { accessControlService } from "../authorization/access-control.service";
/**
 * Higher-order helper to authorize a request context based on roles,
 * permissions, or ABAC policies.
 *
 * Throws UnauthorizedError if request is not authenticated.
 * Throws ForbiddenError if request user does not have sufficient permissions.
 */
export async function authorizeRequest(req, options) {
    const user = req.user;
    if (!user) {
        throw new UnauthorizedError("User is not authenticated on this request.");
    }
    await accessControlService.assertAuthorized(user, options);
}
/**
 * Creates a middleware-like function that asserts the request is authorized.
 */
export function guardRequest(options) {
    return async (req) => {
        await authorizeRequest(req, options);
    };
}
