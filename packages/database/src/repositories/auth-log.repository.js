import { prisma } from "../client";
export class AuthLogRepository {
    /**
     * Log an authentication event.
     */
    async create(data) {
        return prisma.authLog.create({
            data: {
                userId: data.userId,
                event: data.event,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
                metadata: data.metadata,
            },
        });
    }
    /**
     * Find recent logs for a specific user.
     */
    async findRecentByUser(userId, limit = 50) {
        return prisma.authLog.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: limit,
        });
    }
    /**
     * Find recent logs by event type.
     */
    async findRecentByEvent(event, limit = 50) {
        return prisma.authLog.findMany({
            where: { event },
            orderBy: { createdAt: "desc" },
            take: limit,
        });
    }
}
export const authLogRepository = new AuthLogRepository();
