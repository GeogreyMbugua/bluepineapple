import { Prisma } from '@prisma/client';
import { prisma } from '../client.ts';

export class PaymentWebhookEventRepository {
  async create(data: {
    provider: string;
    eventKey: string;
    checkoutRequestId?: string | null;
    payload: Prisma.InputJsonValue;
  }) {
    return prisma.paymentWebhookEvent.create({
      data: {
        provider: data.provider,
        eventKey: data.eventKey,
        checkoutRequestId: data.checkoutRequestId ?? null,
        payload: data.payload,
        status: 'PENDING',
      },
    });
  }

  /**
   * Insert webhook event; on duplicate eventKey return the existing row.
   */
  async createOrGet(data: {
    provider: string;
    eventKey: string;
    checkoutRequestId?: string | null;
    payload: Prisma.InputJsonValue;
  }) {
    try {
      const created = await this.create(data);
      return { event: created, created: true as const };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existing = await this.findByEventKey(data.eventKey);
        if (existing) return { event: existing, created: false as const };
      }
      throw error;
    }
  }

  async findByEventKey(eventKey: string) {
    return prisma.paymentWebhookEvent.findUnique({ where: { eventKey } });
  }

  async findById(id: string) {
    return prisma.paymentWebhookEvent.findUnique({ where: { id } });
  }

  async findPending(limit = 50) {
    return prisma.paymentWebhookEvent.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  /** Requeue FAILED events under max attempts for worker retries. */
  async findRetryable(limit = 50, maxAttempts = 5) {
    return prisma.paymentWebhookEvent.findMany({
      where: {
        OR: [
          { status: 'PENDING' },
          { status: 'FAILED', attempts: { lt: maxAttempts } },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  /**
   * Reset events stuck in PROCESSING (worker crash / after() aborted) back to FAILED
   * so they can be retried.
   */
  async reclaimStaleProcessing(olderThanMs = 5 * 60 * 1000) {
    const cutoff = new Date(Date.now() - olderThanMs);
    return prisma.paymentWebhookEvent.updateMany({
      where: {
        status: 'PROCESSING',
        updatedAt: { lte: cutoff },
      },
      data: {
        status: 'FAILED',
        lastError: 'Reclaimed stale PROCESSING event',
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Atomically claim an event for processing (PENDING or FAILED → PROCESSING).
   * Returns null if another worker already claimed / finished it.
   */
  async claim(id: string) {
    const result = await prisma.paymentWebhookEvent.updateMany({
      where: {
        id,
        status: { in: ['PENDING', 'FAILED'] },
      },
      data: {
        status: 'PROCESSING',
        attempts: { increment: 1 },
        updatedAt: new Date(),
      },
    });
    if (result.count === 0) return null;
    return this.findById(id);
  }

  async markProcessed(id: string) {
    return prisma.paymentWebhookEvent.update({
      where: { id },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async markFailed(id: string, error: string) {
    return prisma.paymentWebhookEvent.update({
      where: { id },
      data: {
        status: 'FAILED',
        lastError: error.slice(0, 2000),
        updatedAt: new Date(),
      },
    });
  }

  async markIgnored(id: string, reason: string) {
    return prisma.paymentWebhookEvent.update({
      where: { id },
      data: {
        status: 'IGNORED',
        lastError: reason.slice(0, 2000),
        processedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}

export const paymentWebhookEventRepository = new PaymentWebhookEventRepository();
