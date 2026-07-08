import { prisma } from "@blue-pineapple/database";
import {
  paymentRepository,
  paymentIntentRepository,
  paymentProviderResponseRepository,
  financeAuditLogRepository,
} from "@blue-pineapple/database";
import { PaymentProviderFactory } from "../payment-providers/payment.providers";
import { eventBus } from "@blue-pineapple/iam";
import { PaymentPolicy } from "../policies";
import type { PaymentCapturedEvent } from "../events";

export class PaymentService {
  async createPaymentFromIntent(intentId: string, actorId?: string): Promise<{ id: string; paymentReference: string }> {
    const intent = await paymentIntentRepository.findById(intentId);
    if (!intent) throw new Error("Payment intent not found");

    const provider = PaymentProviderFactory.create(intent.providerType);
    const start = Date.now();

    let authResult;
    try {
      authResult = await provider.authorize({ intent });
    } catch {
      authResult = { success: false, errorMessage: "Authorization failed" };
    }

    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          paymentReference: `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          intentId,
          amount: intent.amount,
          currency: intent.currency,
          status: authResult.success ? "AUTHORIZED" : "FAILED",
          paymentMethod: intent.paymentMethod,
          providerType: intent.providerType,
          providerPaymentId: authResult.providerPaymentId,
          authorizationCode: authResult.authorizationCode,
          providerResponse: authResult.response,
          failureCode: authResult.errorCode,
          failureReason: authResult.errorMessage,
        } as any,
      });

      await tx.paymentIntent.update({
        where: { id: intentId, status: "PENDING" },
        data: {
          status: authResult.success ? "AUTHORIZED" : "FAILED",
          failureReason: authResult.errorMessage,
          failedAt: authResult.success ? undefined : new Date(),
        },
      });

      return created;
    });

    await paymentProviderResponseRepository.create({
      paymentIntent: { connect: { id: intentId } },
      payment: { connect: { id: result.id } },
      providerName: provider.name,
      providerPaymentId: authResult.providerPaymentId,
      requestPayload: { intentId, amount: Number(intent.amount) } as any,
      responsePayload: authResult.response as any,
      isSuccess: authResult.success,
      errorCode: authResult.errorCode,
      errorMessage: authResult.errorMessage,
      httpStatusCode: authResult.success ? 200 : 400,
      latencyMs: Date.now() - start,
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: authResult.success ? "PAYMENT_AUTHORIZED" : "PAYMENT_FAILED",
      entityType: "Payment",
      entityId: result.id,
      newValues: { status: result.status, providerPaymentId: authResult.providerPaymentId },
    });

    return { id: result.id, paymentReference: result.paymentReference };
  }

  async capturePayment(paymentId: string, actorId?: string): Promise<void> {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) throw new Error("Payment not found");
    PaymentPolicy.assertCanCapture(payment);

    const provider = PaymentProviderFactory.create(payment.providerType);
    const start = Date.now();

    let captureResult;
    try {
      captureResult = await provider.capture({ intent: { id: payment.intentId, amount: payment.amount, currency: payment.currency, paymentMethod: payment.paymentMethod, providerType: payment.providerType }, payment });
    } catch {
      captureResult = { success: false, errorMessage: "Capture failed" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId, status: "AUTHORIZED" },
        data: {
          status: "CAPTURED",
          settledAt: captureResult.success ? new Date() : undefined,
          providerResponse: captureResult.response,
        } as any,
      });

      await tx.paymentIntent.updateMany({
        where: { id: payment.intentId, status: "AUTHORIZED" },
        data: { status: "CAPTURED", capturedAt: new Date() },
      });
    });

    await paymentProviderResponseRepository.create({
      payment: { connect: { id: paymentId } },
      providerName: provider.name,
      providerPaymentId: captureResult.providerPaymentId ?? payment.providerPaymentId ?? undefined,
      requestPayload: { paymentId, amount: Number(payment.amount) } as any,
      responsePayload: captureResult.response as any,
      isSuccess: captureResult.success,
      errorMessage: captureResult.errorMessage,
      httpStatusCode: captureResult.success ? 200 : 400,
      latencyMs: Date.now() - start,
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "PAYMENT_CAPTURED",
      entityType: "Payment",
      entityId: paymentId,
      newValues: { status: "CAPTURED" },
    });

    eventBus.emit("payment.captured", {
      intentId: payment.intentId,
      paymentId,
      amount: Number(payment.amount),
      currency: payment.currency,
      capturedAt: new Date().toISOString(),
    } as PaymentCapturedEvent);
  }

  async refundPayment(paymentId: string, refundId: string, amount: number, actorId?: string): Promise<void> {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) throw new Error("Payment not found");
    PaymentPolicy.assertCanRefund(payment);

    const provider = PaymentProviderFactory.create(payment.providerType);
    const start = Date.now();

    let refundResult;
    try {
      refundResult = await provider.refund({ payment, amount, reason: "Customer refund" });
    } catch {
      refundResult = { success: false, errorMessage: "Refund failed" };
    }

    const newStatus = refundResult.success ? "REFUNDED" : "PARTIALLY_REFUNDED";

    await prisma.$transaction(async (tx) => {
      const existingResponse = (payment.providerResponse as Record<string, unknown>) || {};
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: newStatus,
          refundedAt: new Date(),
          providerResponse: { ...existingResponse, refund: refundResult.response },
        } as any,
      });

      await tx.refund.update({
        where: { id: refundId },
        data: {
          status: refundResult.success ? "COMPLETED" : "FAILED",
          providerRefundId: refundResult.providerRefundId,
          providerResponse: refundResult.response,
          failureReason: refundResult.errorMessage,
          completedAt: refundResult.success ? new Date() : undefined,
        } as any,
      });
    });

    await paymentProviderResponseRepository.create({
      payment: { connect: { id: paymentId } },
      providerName: provider.name,
      providerPaymentId: payment.providerPaymentId ?? undefined,
      requestPayload: { paymentId, refundId, amount } as any,
      responsePayload: refundResult.response as any,
      isSuccess: refundResult.success,
      errorMessage: refundResult.errorMessage,
      httpStatusCode: refundResult.success ? 200 : 400,
      latencyMs: Date.now() - start,
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: refundResult.success ? "REFUND_COMPLETED" : "REFUND_FAILED",
      entityType: "Refund",
      entityId: refundId,
      newValues: { amount, status: refundResult.success ? "COMPLETED" : "FAILED" },
    });
  }

  async findById(id: string) {
    return paymentRepository.findById(id);
  }

  async findByIntent(intentId: string) {
    return paymentRepository.findByIntent(intentId);
  }

  async findByReference(reference: string) {
    return paymentRepository.findByReference(reference);
  }
}

export const paymentService = new PaymentService();
