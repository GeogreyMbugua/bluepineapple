import { auditLogger, type LogContext } from "./audit-logger";
import { authLogRepository } from "@blue-pineapple/database";
import type { AuthLog } from "@prisma/client";

export class AuditService {
  /**
   * Logs a request for OTP login.
   */
  async logLoginRequested(
    identifier: string,
    context: LogContext = {}
  ): Promise<void> {
    await auditLogger.log(
      "LOGIN_REQUESTED",
      null,
      { identifier, method: "OTP" },
      context
    );
  }

  /**
   * Logs a successful user login.
   */
  async logLoginSuccess(
    userId: string,
    identifier: { email?: string; phone?: string },
    context: LogContext = {}
  ): Promise<void> {
    await auditLogger.log(
      "LOGIN_SUCCESS",
      userId,
      { userId, ...identifier },
      context
    );
  }

  /**
   * Logs a failed user login attempt.
   */
  async logLoginFailure(
    identifier: string,
    reason: string,
    errorDetail?: string,
    context: LogContext = {}
  ): Promise<void> {
    await auditLogger.log(
      "LOGIN_FAILED",
      null,
      { identifier, reason, ...(errorDetail !== undefined ? { errorDetail } : {}) },
      context
    );
  }

  /**
   * Logs sending an OTP token.
   */
  async logOtpSent(
    userId: string,
    purpose: string,
    channel: "EMAIL" | "SMS",
    context: LogContext = {}
  ): Promise<void> {
    await auditLogger.log(
      "OTP_SENT",
      userId,
      { userId, purpose, channel },
      context
    );
  }

  /**
   * Logs verification of an OTP token.
   */
  async logOtpVerified(
    userId: string,
    purpose: string,
    context: LogContext = {}
  ): Promise<void> {
    await auditLogger.log(
      "OTP_VERIFIED",
      userId,
      { userId, purpose },
      context
    );
  }

  /**
   * Logs session establishment.
   */
  async logSessionCreated(
    userId: string,
    sessionId: string,
    expiresAt: Date,
    context: LogContext = {}
  ): Promise<void> {
    await auditLogger.log(
      "SESSION_CREATED",
      userId,
      { userId, sessionId, expiresAt: expiresAt.toISOString() },
      context
    );
  }

  /**
   * Logs session revocation.
   */
  async logSessionRevoked(
    userId: string,
    sessionId: string,
    reason?: string,
    context: LogContext = {}
  ): Promise<void> {
    await auditLogger.log(
      "SESSION_REVOKED",
      userId,
      { userId, sessionId, ...(reason !== undefined ? { reason } : {}) },
      context
    );
  }

  /**
   * Logs a user sign-out.
   */
  async logLogout(
    userId: string,
    sessionId: string,
    context: LogContext = {}
  ): Promise<void> {
    await auditLogger.log(
      "LOGOUT",
      userId,
      { userId, sessionId },
      context
    );
  }

  /**
   * Logs role assignment.
   */
  async logRoleAssigned(
    actorId: string | null,
    targetUserId: string,
    roleName: string,
    context: LogContext = {}
  ): Promise<void> {
    await auditLogger.logAdminAction(
      actorId,
      {
        targetUserId,
        action: "ROLE_ASSIGNED",
        details: { roleName },
        ...(typeof actorId === "string" ? { actorId } : {}),
      },
      context
    );
  }

  /**
   * Logs role removal.
   */
  async logRoleRemoved(
    actorId: string | null,
    targetUserId: string,
    roleName: string,
    context: LogContext = {}
  ): Promise<void> {
    await auditLogger.logAdminAction(
      actorId,
      {
        targetUserId,
        action: "ROLE_REMOVED",
        details: { roleName },
        ...(typeof actorId === "string" ? { actorId } : {}),
      },
      context
    );
  }

  /**
   * Retrieve audit logs history for a specific user.
   */
  async getUserHistory(userId: string, limit = 50): Promise<AuthLog[]> {
    return authLogRepository.findRecentByUser(userId, limit);
  }
}

export const auditService = new AuditService();
