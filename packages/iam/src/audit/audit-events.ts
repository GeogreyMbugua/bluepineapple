/**
 * Metadata shape for general administration events (e.g. role/permission assignments).
 * Since the database uses static AuthEvent enums, administrative actions can be logged under
 * a generic classification or mapped to one of the enums with custom metadata.
 */
export interface LoginRequestedMetadata {
  identifier: string; // email or phone
  method: "OTP";
}

/**
 * Metadata shape for LOGIN_SUCCESS event.
 */
export interface LoginSuccessMetadata {
  userId: string;
  email?: string;
  phone?: string;
}

/**
 * Metadata shape for LOGIN_FAILED event.
 */
export interface LoginFailedMetadata {
  identifier: string;
  reason: string;
  errorDetail?: string;
}

/**
 * Metadata shape for OTP_SENT event.
 */
export interface OtpSentMetadata {
  userId: string;
  purpose: string;
  channel: "EMAIL" | "SMS";
}

/**
 * Metadata shape for OTP_VERIFIED event.
 */
export interface OtpVerifiedMetadata {
  userId: string;
  purpose: string;
}

/**
 * Metadata shape for SESSION_CREATED event.
 */
export interface SessionCreatedMetadata {
  userId: string;
  sessionId: string;
  expiresAt: string;
}

/**
 * Metadata shape for SESSION_REVOKED event.
 */
export interface SessionRevokedMetadata {
  userId: string;
  sessionId: string;
  reason?: string;
}

/**
 * Metadata shape for LOGOUT event.
 */
export interface LogoutMetadata {
  userId: string;
  sessionId: string;
}

/**
 * Metadata shape for general administration events (e.g. role/permission assignments).
 * Since the database uses static AuthEvent enums, administrative actions can be logged under
 * a generic classification or mapped to one of the enums with custom metadata.
 */
export interface AdminActionMetadata {
  targetUserId: string;
  action: string;
  details: Record<string, any>;
  actorId?: string;
  entityId?: string;
  targetId?: string;
}

/**
 * Registry matching each AuthEvent type to its expected metadata interface.
 */
export interface AuditEventMetadataMap {
  LOGIN_REQUESTED: LoginRequestedMetadata;
  LOGIN_SUCCESS: LoginSuccessMetadata;
  LOGIN_FAILED: LoginFailedMetadata;
  OTP_SENT: OtpSentMetadata;
  OTP_VERIFIED: OtpVerifiedMetadata;
  SESSION_CREATED: SessionCreatedMetadata;
  SESSION_REVOKED: SessionRevokedMetadata;
  LOGOUT: LogoutMetadata;
}
