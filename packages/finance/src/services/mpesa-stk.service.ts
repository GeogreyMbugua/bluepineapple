import type { InitiateStkInput, InitiateStkResult } from '../mpesa/stk-initiator';
import { mpesaStkInitiator } from '../mpesa/stk-initiator';
import { mpesaStkReconciler } from '../mpesa/stk-reconciler';
import {
  mpesaWebhookIngest,
  mpesaWebhookProcessor,
  type IngestResult,
} from '../mpesa/webhook-processor';
import type { ApplyCallbackResult } from '../mpesa/callback-applicator';
import { paymentIntentRepository } from '@blue-pineapple/database';

export type { InitiateStkInput, InitiateStkResult };

/**
 * Facade for M-Pesa Express STK flows.
 * Heavy lifting lives in mpesa/* modules for testability and clear edge-case ownership.
 */
export class MpesaStkService {
  async initiate(input: InitiateStkInput, actorId?: string): Promise<InitiateStkResult> {
    return mpesaStkInitiator.initiate(input, actorId);
  }

  /**
   * Persist callback then apply. Prefer ingestCallback + processWebhookEvent
   * from the HTTP route so ACK can return before apply.
   */
  async handleCallback(payload: Record<string, unknown>): Promise<ApplyCallbackResult> {
    const ingested = await mpesaWebhookIngest.ingest(payload);
    if (ingested.alreadyFinal) {
      return {
        applied: false,
        status: 'DUPLICATE',
        reason: 'Webhook already processed',
      };
    }
    return mpesaWebhookProcessor.processEvent(ingested.eventId);
  }

  async ingestCallback(payload: unknown): Promise<IngestResult> {
    return mpesaWebhookIngest.ingest(payload);
  }

  async processWebhookEvent(eventId: string) {
    return mpesaWebhookProcessor.processEvent(eventId);
  }

  async processRetryableWebhooks(limit = 50) {
    return mpesaWebhookProcessor.processRetryable(limit);
  }

  async reconcilePending(olderThanMs = 2 * 60 * 1000, limit = 50) {
    return mpesaStkReconciler.reconcilePending(olderThanMs, limit);
  }

  async reconcileIntent(intentId: string) {
    return mpesaStkReconciler.reconcileIntent(intentId);
  }

  async getIntentStatus(intentId: string, options?: { reconcile?: boolean }) {
    if (options?.reconcile) {
      await mpesaStkReconciler.reconcileIntent(intentId);
    }

    const intent = await paymentIntentRepository.findById(intentId);
    if (!intent) return null;

    const payment = intent.payments[0];
    const meta = payment?.metadata as { mpesaReceiptNumber?: string } | null;

    return {
      intentId: intent.id,
      intentReference: intent.intentReference,
      bookingId: intent.bookingId,
      amount: Number(intent.amount),
      currency: intent.currency,
      status: intent.status,
      paymentId: payment?.id,
      paymentStatus: payment?.status,
      checkoutRequestId: payment?.providerPaymentId,
      mpesaReceiptNumber: payment?.externalReceipt ?? meta?.mpesaReceiptNumber,
      failureReason: intent.failureReason ?? payment?.failureReason,
      createdAt: intent.createdAt,
      capturedAt: intent.capturedAt,
    };
  }
}

export const mpesaStkService = new MpesaStkService();
