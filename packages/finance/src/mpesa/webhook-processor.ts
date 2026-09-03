import { paymentWebhookEventRepository } from '@blue-pineapple/database';
import {
  buildStkEventKey,
  stkCallbackPayloadSchema,
} from './callback.schema';
import {
  createMpesaCallbackApplicator,
  type ApplyCallbackResult,
  type MpesaCallbackApplicator,
} from './callback-applicator';

export type IngestResult = {
  eventId: string;
  eventKey: string;
  checkoutRequestId: string;
  duplicate: boolean;
  /** True when event was already PROCESSED/IGNORED — no further work needed. */
  alreadyFinal: boolean;
};

/**
 * Persist STK callback durably before ACK. Validates shape and dedupes by eventKey.
 */
export class MpesaWebhookIngest {
  async ingest(payload: unknown): Promise<IngestResult> {
    const parsed = stkCallbackPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error(`Invalid STK callback: ${parsed.error.issues[0]?.message ?? 'validation failed'}`);
    }

    const cb = parsed.data.Body.stkCallback;
    const eventKey = buildStkEventKey(cb.CheckoutRequestID, cb.ResultCode);

    const { event, created } = await paymentWebhookEventRepository.createOrGet({
      provider: 'MPESA',
      eventKey,
      checkoutRequestId: cb.CheckoutRequestID,
      payload: parsed.data as object,
    });

    const alreadyFinal =
      event.status === 'PROCESSED' || event.status === 'IGNORED';

    return {
      eventId: event.id,
      eventKey,
      checkoutRequestId: cb.CheckoutRequestID,
      duplicate: !created,
      alreadyFinal,
    };
  }
}

/**
 * Claim + apply a durable webhook event to Payment / PaymentIntent.
 */
export class MpesaWebhookProcessor {
  constructor(
    private readonly applicator: MpesaCallbackApplicator = createMpesaCallbackApplicator(),
  ) {}

  async processEvent(eventId: string): Promise<ApplyCallbackResult & { eventStatus: string }> {
    const claimed = await paymentWebhookEventRepository.claim(eventId);
    if (!claimed) {
      const existing = await paymentWebhookEventRepository.findById(eventId);
      return {
        applied: false,
        status: existing?.status ?? 'UNKNOWN',
        reason: 'Not claimable',
        eventStatus: existing?.status ?? 'UNKNOWN',
      };
    }

    try {
      const payload = claimed.payload as Record<string, unknown>;
      const result = await this.applicator.applyFromPayload(payload);

      if (result.status === 'NOT_FOUND' || result.status === 'INVALID') {
        // Keep FAILED so a later retry can succeed once payment row exists
        // (race: callback before payment create commits — rare but possible).
        await paymentWebhookEventRepository.markFailed(
          claimed.id,
          result.reason ?? result.status,
        );
        return { ...result, eventStatus: 'FAILED' };
      }

      if (!result.applied && result.reason === 'Already finalized') {
        await paymentWebhookEventRepository.markIgnored(claimed.id, result.reason);
        return { ...result, eventStatus: 'IGNORED' };
      }

      await paymentWebhookEventRepository.markProcessed(claimed.id);
      return { ...result, eventStatus: 'PROCESSED' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Processing failed';
      await paymentWebhookEventRepository.markFailed(claimed.id, message);
      throw error;
    }
  }

  async processRetryable(limit = 50): Promise<{
    processed: number;
    failed: number;
    skipped: number;
    reclaimed: number;
  }> {
    const reclaimed = await paymentWebhookEventRepository.reclaimStaleProcessing();
    const events = await paymentWebhookEventRepository.findRetryable(limit);
    let processed = 0;
    let failed = 0;
    let skipped = 0;

    for (const event of events) {
      try {
        const result = await this.processEvent(event.id);
        if (result.eventStatus === 'PROCESSED' || result.eventStatus === 'IGNORED') {
          processed += 1;
        } else if (result.eventStatus === 'FAILED') {
          failed += 1;
        } else {
          skipped += 1;
        }
      } catch {
        failed += 1;
      }
    }

    return { processed, failed, skipped, reclaimed: reclaimed.count };
  }
}

export const mpesaWebhookIngest = new MpesaWebhookIngest();
export const mpesaWebhookProcessor = new MpesaWebhookProcessor();
