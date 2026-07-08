import { UnauthorizedError } from "../authorization/errors";
import { verifyAccessToken } from "../auth/jwt.service";
import { validateSession } from "../auth/session.service";
import { userRepository } from "@blue-pineapple/database";
/**
 * Authenticates an incoming request by verifying the JWT token.
 *
 * For now, this acts as a placeholder verification logic that will be
 * connected to the stateful JWT verification service in Phase 1C/1D.
 *
 * It extracts the Authorization header, validates the bearer token, and attaches
 * the AuthUser to the request context. Throws UnauthorizedError if invalid.
 */
export async function authenticateRequest(req) {
    const authHeader = req.headers?.authorization ||
        (typeof req.headers?.get === "function" ? req.headers.get("authorization") : undefined);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError("Authorization header with Bearer token is required.");
    }
    const token = authHeader.substring(7);
    if (!token) {
        throw new UnauthorizedError("Bearer token is empty.");
    }
    // Real verification flow:
    try {
        const payload = verifyAccessToken(token);
        // payload should contain `sid` session id and `sub` user id
        const sessionId = payload.sid;
        const userId = payload.sub;
        if (!sessionId || !userId) {
            throw new UnauthorizedError("Invalid token payload.");
        }
        const session = await validateSession(sessionId);
        if (!session)
            throw new UnauthorizedError("Invalid or expired session.");
        const user = await userRepository.findByIdWithRolesAndPermissions(userId);
        if (!user)
            throw new UnauthorizedError("User not found for session.");
        const authUser = {
            id: user.id,
            email: user.email ?? null,
            phone: user.phone ?? null,
            firstName: user.firstName ?? null,
            lastName: user.lastName ?? null,
            status: user.status,
            roles: user.roles,
            permissions: user.permissions,
        };
        req.user = authUser;
        return authUser;
    }
    catch (error) {
        if (error instanceof UnauthorizedError)
            throw error;
        throw new UnauthorizedError("Failed to authenticate token.");
    }
}
