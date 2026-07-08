import { prisma } from "../client";
import type { AuthLog, AuthEvent, Prisma } from "@prisma/client";

export class AuthLogRepository {
  /**
   * Log an authentication event.
   */
  async create(data: {
    userId?: string | null;
    event: AuthEvent;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Prisma.InputJsonValue | null;
  }): Promise<AuthLog> {
    return prisma.authLog.create({
      data: {
        userId: data.userId ?? null,
        event: data.event,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
        metadata: data.metadata as any,
      },
    });
  }

  /**
   * Find recent logs for a specific user.
   */
  async findRecentByUser(userId: string, limit = 50): Promise<AuthLog[]> {
    return prisma.authLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Find recent logs by event type.
   */
  async findRecentByEvent(event: AuthEvent, limit = 50): Promise<AuthLog[]> {
    return prisma.authLog.findMany({
      where: { event },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

export const authLogRepository = new AuthLogRepository();
