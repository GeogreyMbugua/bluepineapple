/**
 * IAM domain errors.
 *
 * These are pure domain errors — they carry no HTTP framework coupling.
 * The API/middleware layer maps these to appropriate HTTP status codes.
 *
 *   UnauthorizedError → 401  (identity not established)
 *   ForbiddenError    → 403  (identity established, but access denied)
 */
/**
 * Thrown when a request reaches a protected resource without a valid,
 * verified identity. The caller must authenticate first.
 *
 * Maps to HTTP 401 Unauthorized.
 */
export class UnauthorizedError extends Error {
    code = "UNAUTHORIZED";
    statusCode = 401;
    constructor(message = "Authentication required") {
        super(message);
        this.name = "UnauthorizedError";
        // Maintains proper prototype chain in transpiled environments
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}
/**
 * Thrown when an authenticated user attempts an action their roles or
 * permissions do not allow. Identity is established — access is denied.
 *
 * Maps to HTTP 403 Forbidden.
 */
export class ForbiddenError extends Error {
    code = "FORBIDDEN";
    statusCode = 403;
    constructor(message = "Insufficient permissions") {
        super(message);
        this.name = "ForbiddenError";
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}
/**
 * Type guard — returns true if the value is an UnauthorizedError.
 */
export function isUnauthorizedError(err) {
    return err instanceof UnauthorizedError;
}
/**
 * Type guard — returns true if the value is a ForbiddenError.
 */
export function isForbiddenError(err) {
    return err instanceof ForbiddenError;
}
