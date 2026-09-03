import { describe, expect, it } from 'vitest';
import {
  buildStkPassword,
  darajaTimestamp,
  loadDarajaConfig,
  normalizeMsisdn,
  truncateAccountReference,
  truncateTransactionDesc,
} from '../src/daraja/helpers';
import { parseStkCallback } from '../src/daraja/client';
import { DarajaError } from '../src/daraja/types';

describe('daraja helpers', () => {
  it('builds EAT timestamp YYYYMMDDHHmmss', () => {
    // 2021-06-28 06:24:08 UTC → 09:24:08 EAT
    const ts = darajaTimestamp(new Date('2021-06-28T06:24:08.000Z'));
    expect(ts).toBe('20210628092408');
    expect(ts).toHaveLength(14);
  });

  it('builds STK password as Base64(shortcode+passkey+timestamp)', () => {
    const password = buildStkPassword('174379', 'bfb279f9a9dbcbf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919', '20210628092408');
    expect(password).toBe(
      Buffer.from(
        '174379bfb279f9a9dbcbf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c91920210628092408',
        'utf8',
      ).toString('base64'),
    );
  });

  it('normalizes Kenyan phone numbers to 254…', () => {
    expect(normalizeMsisdn('0712345678')).toBe('254712345678');
    expect(normalizeMsisdn('+254712345678')).toBe('254712345678');
    expect(normalizeMsisdn('254712345678')).toBe('254712345678');
    expect(normalizeMsisdn('712345678')).toBe('254712345678');
  });

  it('rejects invalid phones', () => {
    expect(() => normalizeMsisdn('123')).toThrow(DarajaError);
  });

  it('truncates account reference to 12 alphanumeric chars', () => {
    expect(truncateAccountReference('BP-BOOKING-12345')).toBe('BPBOOKING123');
    expect(truncateAccountReference('!!!')).toBe('BOOKING');
  });

  it('truncates transaction desc to 13 chars', () => {
    expect(truncateTransactionDesc('Fort Jesus Trip Payment')).toBe('Fort Jesus Tr');
  });

  it('defaults to Buy Goods and requires DARAJA_PARTY_B', () => {
    const base = {
      DARAJA_CONSUMER_KEY: 'key',
      DARAJA_CONSUMER_SECRET: 'secret',
      DARAJA_SHORTCODE: '123456',
      DARAJA_PASSKEY: 'passkey',
      DARAJA_CALLBACK_URL: 'https://example.com/callback',
    };

    expect(() => loadDarajaConfig(base as NodeJS.ProcessEnv)).toThrow(/DARAJA_PARTY_B/);

    const cfg = loadDarajaConfig({
      ...base,
      DARAJA_PARTY_B: '654321',
    } as NodeJS.ProcessEnv);
    expect(cfg.transactionType).toBe('CustomerBuyGoodsOnline');
    expect(cfg.partyB).toBe('654321');
  });
});

describe('parseStkCallback', () => {
  it('parses a successful callback', () => {
    const parsed = parseStkCallback({
      Body: {
        stkCallback: {
          MerchantRequestID: '29115-34620561-1',
          CheckoutRequestID: 'ws_CO_191220191020363925',
          ResultCode: 0,
          ResultDesc: 'The service request is processed successfully.',
          CallbackMetadata: {
            Item: [
              { Name: 'Amount', Value: 1.0 },
              { Name: 'MpesaReceiptNumber', Value: 'NLJ7RT61SV' },
              { Name: 'TransactionDate', Value: 20191219102115 },
              { Name: 'PhoneNumber', Value: 254708374149 },
            ],
          },
        },
      },
    });

    expect(parsed.success).toBe(true);
    expect(parsed.checkoutRequestId).toBe('ws_CO_191220191020363925');
    expect(parsed.amount).toBe(1);
    expect(parsed.mpesaReceiptNumber).toBe('NLJ7RT61SV');
    expect(parsed.phoneNumber).toBe('254708374149');
  });

  it('parses a cancelled callback', () => {
    const parsed = parseStkCallback({
      Body: {
        stkCallback: {
          MerchantRequestID: 'f1e2-4b95-a71d-b30d3cdbb7a7942864',
          CheckoutRequestID: 'ws_CO_21072024125243250722943992',
          ResultCode: 1032,
          ResultDesc: 'Request cancelled by user',
        },
      },
    });

    expect(parsed.success).toBe(false);
    expect(parsed.resultCode).toBe(1032);
    expect(parsed.mpesaReceiptNumber).toBeUndefined();
  });

  it('rejects invalid payloads', () => {
    expect(() => parseStkCallback({})).toThrow(DarajaError);
  });
});
