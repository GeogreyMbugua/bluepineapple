import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database package export used by the service
vi.mock("@blue-pineapple/database", () => {
  return {
    sessionRepository: {
      findByRefreshToken: vi.fn(),
      create: vi.fn(),
      revoke: vi.fn(),
      revokeAllForUser: vi.fn(),
    },
  };
});

import { sessionRepository } from "@blue-pineapple/database";
import { rotateRefreshToken, generateRefreshToken, hashToken } from "../src/auth/refresh-token.service";
import { UnauthorizedError } from "../src/authorization/errors";

describe("refresh-token rotation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("throws when old token is unknown", async () => {
    (sessionRepository.findByRefreshToken as any).mockResolvedValue(null);
    await expect(rotateRefreshToken("no-such-token")).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("rotates a valid token", async () => {
    const oldTokenPlain = "old-token-plain";
    const userId = "user-1";
    const existing = {
      id: "sess-old",
      userId,
      ipAddress: "1.2.3.4",
      userAgent: "agent",
      revokedAt: null,
    };
    (sessionRepository.findByRefreshToken as any).mockResolvedValue(existing);

    const newSession = { id: "sess-new", userId };
    (sessionRepository.create as any).mockResolvedValue(newSession);
    (sessionRepository.revoke as any).mockResolvedValue(undefined);

    const result = await rotateRefreshToken(oldTokenPlain);
    expect(result).toHaveProperty("newRefreshToken");
    expect(result.sessionId).toBe(newSession.id);
    expect(sessionRepository.create).toHaveBeenCalled();
    expect(sessionRepository.revoke).toHaveBeenCalledWith(existing.id);
  });

  it("detects replay when token already revoked and revokes all user sessions", async () => {
    const existing = {
      id: "sess-old",
      userId: "user-2",
      revokedAt: new Date(),
    };
    (sessionRepository.findByRefreshToken as any).mockResolvedValue(existing);
    (sessionRepository.revokeAllForUser as any).mockResolvedValue(undefined);

    await expect(rotateRefreshToken("reused-token")).rejects.toBeInstanceOf(UnauthorizedError);
    expect(sessionRepository.revokeAllForUser).toHaveBeenCalledWith(existing.userId);
  });
});
