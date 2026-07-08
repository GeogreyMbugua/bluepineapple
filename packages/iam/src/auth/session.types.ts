export type SessionData = {
  sessionId: string;
  userId: string;
  createdAt: string; // ISO
  expiresAt: string; // ISO
  ipAddress?: string | null;
  userAgent?: string | null;
  revoked?: boolean;
  refreshTokenId?: string | null;
};

export type SessionTokenPayload = {
  sub: string; // userId
  sid: string; // sessionId
  iat?: number;
  exp?: number;
};

export type RefreshTokenRecord = {
  id: string;
  tokenHash: string;
  sessionId: string;
  userId: string;
  createdAt: string;
  revoked: boolean;
  replacedBy?: string | null;
  lastUsedAt?: string | null;
};

export const SESSION_CACHE_KEY_PREFIX = "bp:session:";

