import { sessionRepository } from "@blue-pineapple/database";
import { generateRefreshToken, hashToken } from "./refresh-token.service";
import { setSession, deleteSession, getRedisClient } from "./session-cache.service";
import { SessionData } from "./session.types";
import { eventBus } from "../events";
import { DEFAULT_SESSION_CONSTRAINTS } from "../utils/device-tracking";

export async function createSession(userId: string, context?: { ipAddress?: string; userAgent?: string }): Promise<{ sessionId: string; refreshToken: string; expiresAt: string }> {
  const activeSessions = await sessionRepository.findActiveByUser(userId);
  if (activeSessions.length >= DEFAULT_SESSION_CONSTRAINTS.maxActiveSessions) {
    const toRevoke = activeSessions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()).slice(0, activeSessions.length - DEFAULT_SESSION_CONSTRAINTS.maxActiveSessions + 1);
    for (const s of toRevoke) {
      await sessionRepository.revoke(s.id);
    }
  }

  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);


  const created = await sessionRepository.create({
    userId,
    refreshToken: refreshTokenHash,
    expiresAt,
    ipAddress: context?.ipAddress ?? null,
    userAgent: context?.userAgent ?? null,
  });

  const data: SessionData = {
    sessionId: created.id,
    userId: created.userId,
    createdAt: created.createdAt.toISOString(),
    expiresAt: created.expiresAt.toISOString(),
    ipAddress: created.ipAddress ?? null,
    userAgent: created.userAgent ?? null,
    revoked: false,
    refreshTokenId: null,
  };

  const ttlSeconds = Math.max(0, Math.floor((created.expiresAt.getTime() - Date.now()) / 1000));
  try {
    await setSession(created.id, data, ttlSeconds);
  } catch {
    // best-effort cache population
  }

  eventBus.emit("session.created", {
    userId: created.userId,
    sessionId: created.id,
    expiresAt: created.expiresAt.toISOString(),
  });

  return { sessionId: created.id, refreshToken, expiresAt: created.expiresAt.toISOString() };
}

export async function revokeSession(sessionId: string): Promise<void> {
  await sessionRepository.revoke(sessionId);
  try {
    await deleteSession(sessionId);
  } catch {
    // ignore
  }
}

export async function revokeOtherSessions(userId: string, currentSessionId: string): Promise<void> {
  await sessionRepository.revokeOtherSessions(userId, currentSessionId);
}

export async function revokeAllSessions(userId: string): Promise<void> {
  await sessionRepository.revokeAllForUser(userId);

  // best-effort clear cache entries for this user's sessions
  const redis = getRedisClient();
  if (!redis) return;

  try {
    const stream = redis.scanStream({ match: "bp:session:*", count: 100 });
    for await (const keys of stream) {
      if (!keys || keys.length === 0) continue;
      const vals = await redis.mget(...keys);
      for (let i = 0; i < keys.length; i++) {
        const raw = vals[i];
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw) as SessionData;
          if (parsed.userId === userId) {
            await redis.del(keys[i]);
          }
        } catch {
          // ignore parse errors
        }
      }
    }
  } catch (err) {
    // ignore errors in cache cleanup
  }
}

export async function validateSession(sessionId: string): Promise<SessionData | null> {
  // Try cache first
  try {
    const cached = await (await import("./session-cache.service")).getSession(sessionId);
    if (cached) return cached;
  } catch {
    // ignore cache errors
  }

  const db = await sessionRepository.findById(sessionId);
  if (!db) return null;
  if (db.revokedAt) return null;
  if (db.expiresAt.getTime() <= Date.now()) return null;

  const data: SessionData = {
    sessionId: db.id,
    userId: db.userId,
    createdAt: db.createdAt.toISOString(),
    expiresAt: db.expiresAt.toISOString(),
    ipAddress: db.ipAddress ?? null,
    userAgent: db.userAgent ?? null,
    revoked: false,
    refreshTokenId: null,
  };

  const ttlSeconds = Math.max(0, Math.floor((db.expiresAt.getTime() - Date.now()) / 1000));
  try {
    await setSession(db.id, data, ttlSeconds);
  } catch {
    // ignore
  }

  return data;
}
