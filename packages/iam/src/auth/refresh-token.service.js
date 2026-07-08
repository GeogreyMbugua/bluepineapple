import crypto from "crypto";
import { sessionRepository } from "@blue-pineapple/database";
import { UnauthorizedError } from "../authorization/errors";
export function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}
export function generateRefreshToken() {
    return crypto.randomBytes(48).toString("hex");
}
export async function rotateRefreshToken(oldToken) {
    const oldHash = hashToken(oldToken);
    const existing = await sessionRepository.findByRefreshToken(oldHash);
    if (!existing) {
        // token unknown -> possible token theft or invalid
        throw new UnauthorizedError("Invalid refresh token");
    }
    if (existing.revokedAt) {
        // token already revoked -> replay detected
        await sessionRepository.revokeAllForUser(existing.userId);
        throw new UnauthorizedError("Refresh token reuse detected; all sessions revoked");
    }
    // valid current token: rotate
    const newToken = generateRefreshToken();
    const newHash = hashToken(newToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    // create new session row holding the new refresh token
    const newSession = await sessionRepository.create({
        userId: existing.userId,
        refreshToken: newHash,
        expiresAt,
        ipAddress: existing.ipAddress,
        userAgent: existing.userAgent,
    });
    // revoke the old session
    await sessionRepository.revoke(existing.id);
    return { newRefreshToken: newToken, sessionId: newSession.id, userId: newSession.userId };
}
