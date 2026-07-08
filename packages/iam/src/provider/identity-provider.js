import { signAccessToken, verifyAccessToken } from "../auth/jwt.service";
import { validateSession, revokeAllSessions, revokeSession, createSession } from "../auth/session.service";
import { claimsService } from "../claims/claims.service";
import { sessionRevocationService } from "../auth/revocation/session-revocation.service";
import { rotateRefreshToken } from "../auth/refresh-token.service";
import { otpService } from "../auth/otp.service";
import { logoutService } from "../auth/logout.service";
export class IdentityProvider {
    /**
     * Authenticate a session and return claims
     */
    async authenticate(token) {
        try {
            const payload = verifyAccessToken(token);
            const session = await validateSession(payload.sid);
            if (!session)
                return null;
            const cached = await claimsService.getCachedClaims(payload.sub);
            return cached ?? null;
        }
        catch {
            return null;
        }
    }
    /**
     * Request an OTP for login
     */
    async requestLoginOtp(identifier) {
        return otpService.generateLoginOtp(identifier);
    }
    /**
     * Verify and return a session token payload
     */
    async verifyToken(token) {
        try {
            return verifyAccessToken(token);
        }
        catch {
            return null;
        }
    }
    /**
     * Validate a session exists and is active
     */
    async validateSession(sessionId) {
        return validateSession(sessionId);
    }
    async verifyOtp(identifier, otpCode, options) {
        const verified = await otpService.verifyLoginOtp(identifier, otpCode);
        const { sessionId, refreshToken, expiresAt } = await createSession(verified.userId, {
            ipAddress: options?.ipAddress,
            userAgent: options?.userAgent,
        });
        const accessToken = signAccessToken(verified.userId, sessionId);
        const claims = await claimsService.buildClaims(verified.userId, sessionId);
        return {
            accessToken,
            refreshToken,
            expiresAt,
            claims,
        };
    }
    async refresh(refreshToken) {
        const rotated = await rotateRefreshToken(refreshToken);
        const accessToken = signAccessToken(rotated.userId, rotated.sessionId);
        const claims = await claimsService.buildClaims(rotated.userId, rotated.sessionId);
        return {
            accessToken,
            refreshToken: rotated.newRefreshToken,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            claims,
        };
    }
    async logout(userId, sessionId) {
        await logoutService.logout(userId, sessionId);
    }
    /**
     * Build and return claims for a user
     */
    async buildClaims(userId, sessionId) {
        return claimsService.buildClaims(userId, sessionId);
    }
    async revokeSession(sessionId) {
        await revokeSession(sessionId);
    }
    /**
     * Revoke all sessions for a user (logout all devices)
     */
    async revokeAllSessions(userId) {
        return revokeAllSessions(userId);
    }
    /**
     * Revoke sessions with a scenario reason
     */
    async revokeSessions(userId, scenario, reason) {
        return sessionRevocationService.revoke(userId, scenario, reason);
    }
}
export const identityProvider = new IdentityProvider();
