import { describe, expect, it } from 'vitest';
import {
  buildStkEventKey,
  STK_CANCEL_RESULT_CODES,
  stkCallbackPayloadSchema,
} from '../src/mpesa/callback.schema';
import { MpesaPaymentProvider } from '../src/payment-providers/mpesa.provider';
import type { DarajaClient } from '../src/daraja';

describe('stkCallbackPayloadSchema', () => {
  it('accepts a success callback', () => {
    const parsed = stkCallbackPayloadSchema.safeParse({
      Body: {
        stkCallback: {
          MerchantRequestID: 'm-1',
          CheckoutRequestID: 'ws_CO_1',
          ResultCode: 0,
          ResultDesc: 'ok',
          CallbackMetadata: {
            Item: [
              { Name: 'Amount', Value: 100 },
              { Name: 'MpesaReceiptNumber', Value: 'ABC123' },
            ],
          },
        },
      },
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts ResultCode as string', () => {
    const parsed = stkCallbackPayloadSchema.safeParse({
      Body: {
        stkCallback: {
          MerchantRequestID: 'm-1',
          CheckoutRequestID: 'ws_CO_1',
          ResultCode: '1032',
          ResultDesc: 'cancelled',
        },
      },
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects missing CheckoutRequestID', () => {
    const parsed = stkCallbackPayloadSchema.safeParse({
      Body: {
        stkCallback: {
          MerchantRequestID: 'm-1',
          ResultCode: 0,
          ResultDesc: 'ok',
        },
      },
    });
    expect(parsed.success).toBe(false);
  });
});

describe('buildStkEventKey', () => {
  it('is stable for idempotent ingest', () => {
    expect(buildStkEventKey('ws_CO_1', 0)).toBe('mpesa:ws_CO_1:0');
    expect(buildStkEventKey('ws_CO_1', '0')).toBe('mpesa:ws_CO_1:0');
    expect(buildStkEventKey('ws_CO_1', 1032)).toBe('mpesa:ws_CO_1:1032');
  });
});

describe('STK_CANCEL_RESULT_CODES', () => {
  it('treats user cancel and timeout as cancel', () => {
    expect(STK_CANCEL_RESULT_CODES.has(1032)).toBe(true);
    expect(STK_CANCEL_RESULT_CODES.has(1037)).toBe(true);
    expect(STK_CANCEL_RESULT_CODES.has(1)).toBe(false);
  });
});

describe('MpesaPaymentProvider.processWebhook', () => {
  const provider = new MpesaPaymentProvider({} as DarajaClient);

  it('maps success to CAPTURED with receipt', async () => {
    const result = await provider.processWebhook({
      Body: {
        stkCallback: {
          MerchantRequestID: 'm-1',
          CheckoutRequestID: 'ws_CO_1',
          ResultCode: 0,
          ResultDesc: 'ok',
          CallbackMetadata: {
            Item: [
              { Name: 'Amount', Value: 250 },
              { Name: 'MpesaReceiptNumber', Value: 'NLJ7RT61SV' },
              { Name: 'PhoneNumber', Value: 254712345678 },
            ],
          },
        },
      },
    });

    expect(result.paymentStatus).toBe('CAPTURED');
    expect(result.checkoutRequestId).toBe('ws_CO_1');
    expect(result.mpesaReceiptNumber).toBe('NLJ7RT61SV');
    expect(result.amount).toBe(250);
  });

  it('maps 1032 to CANCELLED', async () => {
    const result = await provider.processWebhook({
      Body: {
        stkCallback: {
          MerchantRequestID: 'm-1',
          CheckoutRequestID: 'ws_CO_1',
          ResultCode: 1032,
          ResultDesc: 'Request cancelled by user',
        },
      },
    });

    expect(result.paymentStatus).toBe('CANCELLED');
    expect(result.resultCode).toBe(1032);
    expect(result.mpesaReceiptNumber).toBeUndefined();
  });

  it('maps other non-zero codes to FAILED', async () => {
    const result = await provider.processWebhook({
      Body: {
        stkCallback: {
          MerchantRequestID: 'm-1',
          CheckoutRequestID: 'ws_CO_1',
          ResultCode: 1,
          ResultDesc: 'Insufficient funds',
        },
      },
    });

    expect(result.paymentStatus).toBe('FAILED');
  });
});
