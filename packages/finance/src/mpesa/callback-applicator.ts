import { Prisma } from '@prisma/client';
import {
  financeAuditLogRepository,
  paymentIntentRepository,
  paymentProviderResponseRepository,
  paymentRepository,
  prisma,
  runInTransaction,
} from '@blue-pineapple/database';
import { eventBus } from '@blue-pineapple/iam';
import type { DarajaClient } from '../daraja';
import { MpesaPaymentProvider } from '../payment-providers/mpesa.provider';
import type { WebhookResult } from '../payment-providers/types';
import type {
  PaymentCapturedEvent,
  PaymentCancelledEvent,
  PaymentFailedEvent,
} from '../events';
import { STK_CANCEL_RESULT_CODES } from './callback.schema';

export type ApplyCallbackResult = {
  applied: boolean;
  paymentId?: string;
  intentId?: string;
  status: string;
  reason?: string;
};

type PaymentRow = NonNullable<
  Awaited<ReturnType<typeof paymentRepository.findByProviderPaymentId>>
>;

/**
 * Applies a parsed STK webhook result to Payment + PaymentIntent idempotently.
 */
export class MpesaCallbackApplicator {
  constructor(private readonly provider: MpesaPaymentProvider = new MpesaPaymentProvider()) {}

  async applyFromPayload(payload: Record<string, unknown>): Promise<ApplyCallbackResult> {
    const result = await this.provider.processWebhook(payload);
    return this.applyWebhookResult(result, payload);
  }

  async applyWebhookResult(
    result: WebhookResult,
    rawPayload?: Record<string, unknown>,
  ): Promise<ApplyCallbackResult> {
    const checkoutRequestId = result.checkoutRequestId;
    if (!checkoutRequestId) {
      return { applied: false, status: 'INVALID', reason: 'Missing CheckoutRequestID' };
    }

    const payment = await paymentRepository.findByProviderPaymentId(checkoutRequestId);
    if (!payment) {
      await paymentProviderResponseRepository.create({
        providerName: this.provider.name,
        providerPaymentId: checkoutRequestId,
        requestPayload: (rawPayload ?? result) as object,
        responsePayload: result as object,
        isSuccess: false,
        errorCode: 'NOT_FOUND',
        errorMessage: 'No payment found for CheckoutRequestID',
        httpStatusCode: 404,
        latencyMs: 0,
      } as never);

      return {
        applied: false,
        status: 'NOT_FOUND',
        reason: 'No payment found for CheckoutRequestID',
      };
    }

    if (
      payment.status === 'CAPTURED' ||
      payment.status === 'FAILED' ||
      payment.status === 'CANCELLED'
    ) {
      // Late success after cancel/fail: do not resurrect. Ops must handle manually.
      // Duplicate success after capture: fill receipt if missing.
      if (
        payment.status === 'CAPTURED' &&
        result.paymentStatus === 'CAPTURED' &&
        result.mpesaReceiptNumber &&
        !payment.externalReceipt
      ) {
        await this.fillMissingReceipt(payment, result);
      }

      return {
        applied: false,
        paymentId: payment.id,
        intentId: payment.intentId,
        status: payment.status,
        reason: 'Already finalized',
      };
    }

    if (result.paymentStatus === 'CAPTURED') {
      return this.capturePayment(payment, result);
    }

    const failedStatus =
      result.paymentStatus === 'CANCELLED' ||
      (result.resultCode !== undefined && STK_CANCEL_RESULT_CODES.has(Number(result.resultCode)))
        ? 'CANCELLED'
        : 'FAILED';

    return this.failPayment(payment, result, failedStatus);
  }

  private async fillMissingReceipt(payment: PaymentRow, result: WebhookResult): Promise<void> {
    try {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          externalReceipt: result.mpesaReceiptNumber,
          metadata: {
            ...((payment.metadata as Record<string, unknown> | null) ?? {}),
            mpesaReceiptNumber: result.mpesaReceiptNumber,
            callbackAmount: result.amount,
            callbackPhone: result.phoneNumber,
            receiptBackfilled: true,
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return;
      }
      throw error;
    }
  }

  private async capturePayment(
    payment: PaymentRow,
    result: WebhookResult,
  ): Promise<ApplyCallbackResult> {
    const expectedAmount = Number(payment.amount);
    const paidAmount =
      result.amount !== undefined && Number.isFinite(result.amount)
        ? Number(result.amount)
        : expectedAmount;
    const amountMismatch =
      result.amount !== undefined &&
      Number.isFinite(result.amount) &&
      Math.abs(paidAmount - expectedAmount) > 0.009;
    const underpaid = amountMismatch && paidAmount < expectedAmount;

    if (result.mpesaReceiptNumber) {
      const existingReceipt = await prisma.payment.findFirst({
        where: {
          externalReceipt: result.mpesaReceiptNumber,
          NOT: { id: payment.id },
        },
      });
      if (existingReceipt) {
        return {
          applied: false,
          paymentId: existingReceipt.id,
          intentId: existingReceipt.intentId,
          status: existingReceipt.status,
          reason: 'Receipt already recorded',
        };
      }
    }

    const metadata = {
      ...((payment.metadata as Record<string, unknown> | null) ?? {}),
      mpesaReceiptNumber: result.mpesaReceiptNumber,
      callbackAmount: result.amount ?? paidAmount,
      callbackPhone: result.phoneNumber,
      amountMismatch,
      expectedAmount,
      reconciledVia: result.mpesaReceiptNumber ? 'callback' : 'no_receipt_yet',
    };

    let updated: boolean | null = null;
    try {
      updated = await runInTransaction(async (tx) => {
        const payUpdate = await tx.payment.updateMany({
          where: {
            id: payment.id,
            status: { in: ['PENDING', 'AUTHORIZED'] },
          },
          data: {
            status: 'CAPTURED',
            capturedAt: new Date(),
            settledAt: new Date(),
            externalReceipt: result.mpesaReceiptNumber ?? undefined,
            providerResponse: result.raw as object,
            metadata,
          },
        });

        if (payUpdate.count === 0) return null;

        await tx.paymentIntent.updateMany({
          where: {
            id: payment.intentId,
            status: { in: ['PENDING', 'AUTHORIZED'] },
          },
          data: {
            status: 'CAPTURED',
            capturedAt: new Date(),
          },
        });

        return true;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return {
          applied: false,
          paymentId: payment.id,
          intentId: payment.intentId,
          status: 'CAPTURED',
          reason: 'Receipt already recorded',
        };
      }
      throw error;
    }

    if (!updated) {
      const fresh = await paymentRepository.findById(payment.id);
      return {
        applied: false,
        paymentId: payment.id,
        intentId: payment.intentId,
        status: fresh?.status ?? payment.status,
        reason: 'Concurrent finalize',
      };
    }

    await financeAuditLogRepository.create({
      action: 'PAYMENT_CAPTURED',
      entityType: 'Payment',
      entityId: payment.id,
      newValues: {
        status: 'CAPTURED',
        mpesaReceiptNumber: result.mpesaReceiptNumber,
        amount: paidAmount,
        amountMismatch,
        underpaid,
      },
    });

    const intent =
      payment.intent ?? (await paymentIntentRepository.findById(payment.intentId));

    if (underpaid && intent) {
      await prisma.paymentIntent.update({
        where: { id: payment.intentId },
        data: {
          metadata: {
            ...((intent.metadata as object) ?? {}),
            underpayment: true,
            expectedAmount,
            paidAmount,
            bookingId: intent.bookingId,
          },
        },
      });
    }

    eventBus.emit('payment.captured', {
      intentId: payment.intentId,
      paymentId: payment.id,
      amount: paidAmount,
      currency: payment.currency,
      capturedAt: new Date().toISOString(),
      // Explicit false suppresses booking confirm on underpayment (bridge must honor this).
      bookingId: underpaid ? undefined : (intent?.bookingId ?? undefined),
      confirmBooking: !underpaid,
      mpesaReceiptNumber: result.mpesaReceiptNumber,
      expectedAmount,
      underpaid,
    } as PaymentCapturedEvent);

    return {
      applied: true,
      paymentId: payment.id,
      intentId: payment.intentId,
      status: 'CAPTURED',
      reason: underpaid
        ? 'Captured with underpayment'
        : amountMismatch
          ? 'Captured with amount mismatch'
          : undefined,
    };
  }

  private async failPayment(
    payment: PaymentRow,
    result: WebhookResult,
    failedStatus: 'FAILED' | 'CANCELLED',
  ): Promise<ApplyCallbackResult> {
    const updated = await runInTransaction(async (tx) => {
      const payUpdate = await tx.payment.updateMany({
        where: {
          id: payment.id,
          status: { in: ['PENDING', 'AUTHORIZED'] },
        },
        data: {
          status: failedStatus,
          failureCode: String(result.resultCode ?? ''),
          failureReason: result.resultDesc ?? result.errorMessage,
          providerResponse: result.raw as object,
        },
      });

      if (payUpdate.count === 0) return null;

      await tx.paymentIntent.updateMany({
        where: {
          id: payment.intentId,
          status: { in: ['PENDING', 'AUTHORIZED'] },
        },
        data: {
          status: failedStatus === 'CANCELLED' ? 'CANCELLED' : 'FAILED',
          failedAt: failedStatus === 'FAILED' ? new Date() : undefined,
          cancelledAt: failedStatus === 'CANCELLED' ? new Date() : undefined,
          failureReason: result.resultDesc ?? result.errorMessage,
        },
      });

      return true;
    });

    if (!updated) {
      const fresh = await paymentRepository.findById(payment.id);
      return {
        applied: false,
        paymentId: payment.id,
        intentId: payment.intentId,
        status: fresh?.status ?? payment.status,
        reason: 'Concurrent finalize',
      };
    }

    if (failedStatus === 'CANCELLED') {
      eventBus.emit('payment.cancelled', {
        intentId: payment.intentId,
        paymentId: payment.id,
        reason: result.resultDesc,
      } as PaymentCancelledEvent);
    } else {
      eventBus.emit('payment.failed', {
        intentId: payment.intentId,
        paymentId: payment.id,
        reason: result.resultDesc ?? 'STK failed',
        failureCode: String(result.resultCode ?? ''),
        providerType: 'MPESA',
      } as PaymentFailedEvent);
    }

    return {
      applied: true,
      paymentId: payment.id,
      intentId: payment.intentId,
      status: failedStatus,
    };
  }
}

export function createMpesaCallbackApplicator(daraja?: DarajaClient): MpesaCallbackApplicator {
  return new MpesaCallbackApplicator(
    daraja ? new MpesaPaymentProvider(daraja) : new MpesaPaymentProvider(),
  );
}
