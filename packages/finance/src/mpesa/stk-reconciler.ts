import { paymentIntentRepository } from '@blue-pineapple/database';
import { getDarajaClient, type DarajaClient } from '../daraja';
import {
  createMpesaCallbackApplicator,
  type MpesaCallbackApplicator,
} from './callback-applicator';
import { STK_CANCEL_RESULT_CODES } from './callback.schema';

export type ReconcileResult = {
  checked: number;
  captured: number;
  failed: number;
  stillPending: number;
};

/**
 * Poll Daraja STK Query for aged pending intents.
 * Never invents M-Pesa receipt numbers — success without receipt still captures
 * but leaves externalReceipt null for a later callback to fill.
 */
export class MpesaStkReconciler {
  private readonly daraja?: DarajaClient;
  private readonly applicatorOverride?: MpesaCallbackApplicator;

  constructor(daraja?: DarajaClient, applicator?: MpesaCallbackApplicator) {
    this.daraja = daraja;
    this.applicatorOverride = applicator;
  }

  private get client(): DarajaClient {
    return this.daraja ?? getDarajaClient();
  }

  private get applicator(): MpesaCallbackApplicator {
    return this.applicatorOverride ?? createMpesaCallbackApplicator(this.client);
  }

  async reconcilePending(olderThanMs = 2 * 60 * 1000, limit = 50): Promise<ReconcileResult> {
    const cutoff = new Date(Date.now() - olderThanMs);
    const intents = await paymentIntentRepository.findPendingMpesaOlderThan(cutoff, limit);

    let captured = 0;
    let failed = 0;
    let stillPending = 0;

    for (const intent of intents) {
      const outcome = await this.reconcileIntentRecord(intent);
      if (outcome === 'CAPTURED') captured += 1;
      else if (outcome === 'FAILED' || outcome === 'CANCELLED') failed += 1;
      else stillPending += 1;
    }

    return {
      checked: intents.length,
      captured,
      failed,
      stillPending,
    };
  }

  /**
   * Query Daraja for a single pending intent and apply the terminal result.
   * Used by checkout UI when the async callback was missed (e.g. tunnel down).
   */
  async reconcileIntent(intentId: string): Promise<{
    status: string;
    applied: boolean;
    reason?: string;
  }> {
    const intent = await paymentIntentRepository.findById(intentId);
    if (!intent) {
      return { status: 'NOT_FOUND', applied: false, reason: 'Payment intent not found' };
    }

    if (intent.status !== 'PENDING' && intent.status !== 'AUTHORIZED') {
      return { status: intent.status, applied: false, reason: 'Already finalized' };
    }

    const outcome = await this.reconcileIntentRecord(intent);
    return {
      status: outcome,
      applied: outcome === 'CAPTURED' || outcome === 'FAILED' || outcome === 'CANCELLED',
    };
  }

  private async reconcileIntentRecord(intent: {
    id: string;
    amount: unknown;
    payments: Array<{
      providerPaymentId: string | null;
      status: string;
    }>;
  }): Promise<string> {
    const payment =
      intent.payments.find((p) => p.providerPaymentId && p.status === 'PENDING') ??
      intent.payments[0];
    const checkoutRequestId = payment?.providerPaymentId;
    if (!checkoutRequestId) return 'PENDING';

    try {
      const query = await this.client.stkPushQuery({ checkoutRequestId });
      const resultCode =
        query.ResultCode !== undefined ? Number(query.ResultCode) : undefined;

      if (resultCode === undefined || Number.isNaN(resultCode)) {
        return 'PENDING';
      }

      if (resultCode === 0) {
        const applied = await this.applicator.applyFromPayload({
          Body: {
            stkCallback: {
              MerchantRequestID: query.MerchantRequestID,
              CheckoutRequestID: query.CheckoutRequestID,
              ResultCode: 0,
              ResultDesc: query.ResultDesc ?? 'Reconciled via STK query',
            },
          },
        });
        return applied.status === 'CAPTURED' ? 'CAPTURED' : 'PENDING';
      }

      const isCancel = STK_CANCEL_RESULT_CODES.has(resultCode);
      const applied = await this.applicator.applyFromPayload({
        Body: {
          stkCallback: {
            MerchantRequestID: query.MerchantRequestID,
            CheckoutRequestID: query.CheckoutRequestID,
            ResultCode: resultCode,
            ResultDesc:
              query.ResultDesc ??
              (isCancel ? 'Request cancelled by user' : 'STK query failed'),
          },
        },
      });

      if (applied.applied) {
        return applied.status;
      }
      return applied.status === 'CAPTURED' ||
        applied.status === 'FAILED' ||
        applied.status === 'CANCELLED'
        ? applied.status
        : 'PENDING';
    } catch {
      return 'PENDING';
    }
  }
}

export const mpesaStkReconciler = new MpesaStkReconciler();
