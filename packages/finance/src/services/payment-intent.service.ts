import { prisma } from "@blue-pineapple/database";
import {
  paymentIntentRepository,
  financeAuditLogRepository,
} from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import { PaymentPolicy, IntentPolicy } from "../policies";
import type {
  PaymentIntentCreatedEvent,
  PaymentAuthorizedEvent,
  PaymentCapturedEvent,
  PaymentFailedEvent,
  PaymentCancelledEvent,
  PaymentExpiredEvent,
} from "../events";
import type { IntentStatus } from "@prisma/client";

export class IntentService {
  private static generateReference(): string {
    return `PI-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  async create(input: {
    bookingId?: string;
    commercialSummaryId?: string;
    customerId?: string;
    partnerId?: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    providerType: string;
    idempotencyKey?: string;
    correlationId?: string;
    metadata?: any;
    expiresInMinutes?: number;
  }, actorId?: string): Promise<{ id: string; intentReference: string }> {
    IntentPolicy.assertCanCreate(input.bookingId, input.commercialSummaryId);
    PaymentPolicy.assertValidProviderType(input.providerType);
    PaymentPolicy.assertValidMethod(input.paymentMethod);
    PaymentPolicy.assertValidAmount(input.amount);

    const intentReference = IntentService.generateReference();
    const expiresAt = new Date(Date.now() + (input.expiresInMinutes ?? 30) * 60 * 1000);

    const intent = await prisma.paymentIntent.create({
      data: {
        intentReference,
        bookingId: input.bookingId,
        commercialSummaryId: input.commercialSummaryId,
        customerId: input.customerId,
        partnerId: input.partnerId,
        amount: input.amount.toFixed(2),
        currency: input.currency,
        status: "PENDING",
        paymentMethod: input.paymentMethod as any,
        providerType: input.providerType as any,
        idempotencyKey: input.idempotencyKey,
        correlationId: input.correlationId,
        metadata: input.metadata,
        expiresAt,
      },
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "PAYMENT_INTENT_CREATED",
      entityType: "PaymentIntent",
      entityId: intent.id,
      newValues: { intentReference, amount: input.amount, currency: input.currency, status: "PENDING" },
      metadata: { bookingId: input.bookingId, correlationId: input.correlationId },
    });

    eventBus.emit("payment.intent.created", {
      intentId: intent.id,
      intentReference: intent.intentReference,
      bookingId: input.bookingId ?? undefined,
      customerId: input.customerId ?? undefined,
      partnerId: input.partnerId ?? undefined,
      amount: input.amount,
      currency: input.currency,
      paymentMethod: input.paymentMethod,
      providerType: input.providerType,
      status: "PENDING",
    } as PaymentIntentCreatedEvent);

    return { id: intent.id, intentReference: intent.intentReference };
  }

  async authorize(intentId: string, actorId?: string): Promise<{ paymentId: string }> {
    const intent = await paymentIntentRepository.findById(intentId);
    if (!intent) throw new Error("Payment intent not found");
    IntentPolicy.assertValidTransition(intent.status as IntentStatus, "AUTHORIZED");
    PaymentPolicy.assertValidAmount(Number(intent.amount));

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.paymentIntent.update({
        where: { id: intentId, status: "PENDING" },
        data: { status: "AUTHORIZED" },
      });

      const created = await tx.payment.create({
        data: {
          paymentReference: `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          intentId,
          amount: updated.amount,
          currency: updated.currency,
          status: "AUTHORIZED",
          paymentMethod: updated.paymentMethod,
          providerType: updated.providerType,
        },
      });

      return { updated, created };
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "PAYMENT_AUTHORIZED",
      entityType: "Payment",
      entityId: result.created.id,
      newValues: { paymentReference: (result.created as any).paymentReference, status: "AUTHORIZED" },
    });

    eventBus.emit("payment.authorized", {
      intentId,
      paymentId: result.created.id,
      authorizationCode: `AUTH-${Date.now()}`,
      amount: Number(result.created.amount),
      currency: result.created.currency,
      providerType: result.created.providerType,
    } as PaymentAuthorizedEvent);

    return { paymentId: result.created.id };
  }

  async capture(intentId: string, actorId?: string): Promise<{ paymentId: string }> {
    const intent = await paymentIntentRepository.findById(intentId);
    if (!intent) throw new Error("Payment intent not found");
    IntentPolicy.assertValidTransition(intent.status as IntentStatus, "CAPTURED");

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.paymentIntent.update({
        where: { id: intentId, status: "AUTHORIZED" },
        data: { status: "CAPTURED", capturedAt: new Date() },
      });

      const payments = await tx.payment.findMany({
        where: { intentId, status: "AUTHORIZED" },
      });

      for (const pay of payments) {
        await tx.payment.update({
          where: { id: pay.id },
          data: { status: "CAPTURED", capturedAt: new Date() },
        });
      }

      return { updated, payments };
    });

    for (const pay of result.payments) {
      await financeAuditLogRepository.create({
        userId: actorId,
        action: "PAYMENT_CAPTURED",
        entityType: "Payment",
        entityId: pay.id,
        newValues: { status: "CAPTURED" },
      });

      eventBus.emit("payment.captured", {
        intentId,
        paymentId: pay.id,
        amount: Number(pay.amount),
        currency: pay.currency,
        capturedAt: new Date().toISOString(),
      } as PaymentCapturedEvent);
    }

    return { paymentId: result.payments[0]?.id ?? "" };
  }

  async fail(intentId: string, reason: string, actorId?: string): Promise<void> {
    const intent = await paymentIntentRepository.findById(intentId);
    if (!intent) throw new Error("Payment intent not found");
    IntentPolicy.assertValidTransition(intent.status as IntentStatus, "FAILED");

    await prisma.paymentIntent.update({
      where: { id: intentId, status: { in: ["PENDING", "AUTHORIZED"] } },
      data: { status: "FAILED", failureReason: reason, failedAt: new Date() },
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "PAYMENT_FAILED",
      entityType: "PaymentIntent",
      entityId: intentId,
      newValues: { status: "FAILED", failureReason: reason },
    });

    eventBus.emit("payment.failed", {
      intentId,
      reason,
      providerType: intent.providerType,
    } as PaymentFailedEvent);
  }

  async cancel(intentId: string, reason?: string, actorId?: string): Promise<void> {
    const intent = await paymentIntentRepository.findById(intentId);
    if (!intent) throw new Error("Payment intent not found");
    IntentPolicy.assertValidTransition(intent.status as IntentStatus, "CANCELLED");

    await prisma.paymentIntent.update({
      where: { id: intentId, status: { in: ["PENDING", "AUTHORIZED"] } },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "PAYMENT_CANCELLED",
      entityType: "PaymentIntent",
      entityId: intentId,
      newValues: { status: "CANCELLED", reason },
    });

    eventBus.emit("payment.cancelled", {
      intentId,
      reason: reason ?? undefined,
    } as PaymentCancelledEvent);
  }

  async expire(intentId: string, actorId?: string): Promise<void> {
    const intent = await paymentIntentRepository.findById(intentId);
    if (!intent) throw new Error("Payment intent not found");
    IntentPolicy.assertValidTransition(intent.status as IntentStatus, "EXPIRED");

    await prisma.paymentIntent.update({
      where: { id: intentId, status: "PENDING" },
      data: { status: "EXPIRED", failedAt: new Date() },
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "PAYMENT_EXPIRED",
      entityType: "PaymentIntent",
      entityId: intentId,
      newValues: { status: "EXPIRED" },
    });

    eventBus.emit("payment.expired", {
      intentId,
    } as PaymentExpiredEvent);
  }

  async findById(id: string) {
    return paymentIntentRepository.findById(id);
  }

  async findByReference(reference: string) {
    return paymentIntentRepository.findByReference(reference);
  }

  async findByStatus(status: string, limit = 100) {
    return paymentIntentRepository.findByStatus(status as any, limit);
  }
}

export const intentService = new IntentService();
