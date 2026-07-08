import { prisma } from "../client";
export class SessionRepository {
    /**
     * Create a new session.
     */
    async create(data) {
        return prisma.session.create({
            data: {
                userId: data.userId,
                refreshToken: data.refreshToken,
                expiresAt: data.expiresAt,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
            },
        });
    }
    /**
     * Find a session by its ID.
     */
    async findById(id) {
        return prisma.session.findUnique({
            where: { id },
        });
    }
    /**
     * Find a session by its refresh token (includes revoked/expired)
     */
    async findByRefreshToken(refreshToken) {
        return prisma.session.findUnique({ where: { refreshToken } });
    }
    /**
     * Find an active session by its refresh token.
     * A session is active if expiresAt has not passed and it has not been revoked.
     */
    async findActiveByRefreshToken(refreshToken) {
        return prisma.session.findFirst({
            where: {
                refreshToken,
                expiresAt: {
                    gt: new Date(),
                },
                revokedAt: null,
            },
        });
    }
    /**
     * Revoke a single session by its ID.
     */
    async revoke(id) {
        return prisma.session.update({
            where: { id },
            data: {
                revokedAt: new Date(),
            },
        });
    }
    /**
     * Revoke all active sessions for a given user.
     */
    async revokeAllForUser(userId) {
        return prisma.session.updateMany({
            where: {
                userId,
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
            },
        });
    }
    /**
     * Find all active sessions for a user.
     */
    async findActiveByUser(userId) {
        return prisma.session.findMany({
            where: {
                userId,
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "asc" },
        });
    }
    async revokeOtherSessions(userId, keepSessionId) {
        return prisma.session.updateMany({
            where: { userId, id: { not: keepSessionId }, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
    /**
     * Clean up expired or revoked sessions older than a certain date.
     */
    async deleteExpiredOrRevokedBefore(date) {
        return prisma.session.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: date } },
                    { revokedAt: { lt: date } },
                ],
            },
        });
    }
}
export const sessionRepository = new SessionRepository();
