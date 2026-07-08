import { auditLogger } from "./audit-logger";
import { authLogRepository } from "@blue-pineapple/database";
export class AuditService {
    /**
     * Logs a request for OTP login.
     */
    async logLoginRequested(identifier, context = {}) {
        await auditLogger.log("LOGIN_REQUESTED", null, { identifier, method: "OTP" }, context);
    }
    /**
     * Logs a successful user login.
     */
    async logLoginSuccess(userId, identifier, context = {}) {
        await auditLogger.log("LOGIN_SUCCESS", userId, { userId, ...identifier }, context);
    }
    /**
     * Logs a failed user login attempt.
     */
    async logLoginFailure(identifier, reason, errorDetail, context = {}) {
        await auditLogger.log("LOGIN_FAILED", null, { identifier, reason, errorDetail }, context);
    }
    /**
     * Logs sending an OTP token.
     */
    async logOtpSent(userId, purpose, channel, context = {}) {
        await auditLogger.log("OTP_SENT", userId, { userId, purpose, channel }, context);
    }
    /**
     * Logs verification of an OTP token.
     */
    async logOtpVerified(userId, purpose, context = {}) {
        await auditLogger.log("OTP_VERIFIED", userId, { userId, purpose }, context);
    }
    /**
     * Logs session establishment.
     */
    async logSessionCreated(userId, sessionId, expiresAt, context = {}) {
        await auditLogger.log("SESSION_CREATED", userId, { userId, sessionId, expiresAt: expiresAt.toISOString() }, context);
    }
    /**
     * Logs session revocation.
     */
    async logSessionRevoked(userId, sessionId, reason, context = {}) {
        await auditLogger.log("SESSION_REVOKED", userId, { userId, sessionId, reason }, context);
    }
    /**
     * Logs a user sign-out.
     */
    async logLogout(userId, sessionId, context = {}) {
        await auditLogger.log("LOGOUT", userId, { userId, sessionId }, context);
    }
    /**
     * Logs role assignment.
     */
    async logRoleAssigned(actorId, targetUserId, roleName, context = {}) {
        await auditLogger.logAdminAction(actorId, {
            targetUserId,
            action: "ROLE_ASSIGNED",
            details: { roleName },
            actorId: actorId ?? undefined,
        }, context);
    }
    /**
     * Logs role removal.
     */
    async logRoleRemoved(actorId, targetUserId, roleName, context = {}) {
        await auditLogger.logAdminAction(actorId, {
            targetUserId,
            action: "ROLE_REMOVED",
            details: { roleName },
            actorId: actorId ?? undefined,
        }, context);
    }
    /**
     * Retrieve audit logs history for a specific user.
     */
    async getUserHistory(userId, limit = 50) {
        return authLogRepository.findRecentByUser(userId, limit);
    }
}
export const auditService = new AuditService();
