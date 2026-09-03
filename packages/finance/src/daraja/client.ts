import { DarajaAuthClient } from './auth';
import {
  buildStkPassword,
  darajaTimestamp,
  getDarajaBaseUrl,
  loadDarajaConfig,
  normalizeMsisdn,
  truncateAccountReference,
  truncateTransactionDesc,
} from './helpers';
import type {
  DarajaConfig,
  ParsedStkCallback,
  StkCallbackBody,
  StkPushInput,
  StkPushAcknowledgement,
  StkPushQueryAcknowledgement,
  StkPushQueryInput,
} from './types';
import { DarajaError } from './types';

export class DarajaClient {
  readonly auth: DarajaAuthClient;

  constructor(private readonly config: DarajaConfig) {
    this.auth = new DarajaAuthClient(config);
  }

  getConfig(): Readonly<DarajaConfig> {
    return this.config;
  }

  /**
   * Initiate M-Pesa Express STK Push.
   * Sync ResponseCode "0" means the PIN prompt was queued — not that payment succeeded.
   */
  async stkPush(input: StkPushInput): Promise<StkPushAcknowledgement> {
    const amount = Math.round(Number(input.amount));
    if (!Number.isFinite(amount) || amount < 1) {
      throw new DarajaError('STK amount must be a whole number >= 1', 'INVALID_AMOUNT');
    }

    const phone = normalizeMsisdn(input.phone);
    const timestamp = darajaTimestamp();
    const password = buildStkPassword(this.config.shortcode, this.config.passkey, timestamp);

    // Buy Goods: BusinessShortCode = HO/store, PartyB = Till number (Daraja FAQ).
    // Paybill: PartyB usually equals BusinessShortCode.
    const partyB =
      this.config.transactionType === 'CustomerBuyGoodsOnline'
        ? this.config.partyB
        : (this.config.partyB ?? this.config.shortcode);

    if (!partyB) {
      throw new DarajaError(
        'PartyB (Till number) is required for CustomerBuyGoodsOnline',
        'MISSING_CONFIG',
      );
    }

    const payload = {
      BusinessShortCode: Number(this.config.shortcode),
      Password: password,
      Timestamp: timestamp,
      TransactionType: this.config.transactionType,
      Amount: amount,
      PartyA: phone,
      PartyB: partyB,
      PhoneNumber: phone,
      CallBackURL: input.callbackUrl ?? this.config.callbackUrl,
      AccountReference: truncateAccountReference(input.accountReference),
      TransactionDesc: truncateTransactionDesc(input.transactionDesc ?? 'Payment'),
    };

    return this.postJson<StkPushAcknowledgement>(
      '/mpesa/stkpush/v1/processrequest',
      payload,
    );
  }

  /**
   * Query STK Push status by CheckoutRequestID (reconciliation when callback is missing).
   */
  async stkPushQuery(input: StkPushQueryInput): Promise<StkPushQueryAcknowledgement> {
    const timestamp = darajaTimestamp();
    const password = buildStkPassword(this.config.shortcode, this.config.passkey, timestamp);

    const payload = {
      BusinessShortCode: Number(this.config.shortcode),
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: input.checkoutRequestId,
    };

    return this.postJson<StkPushQueryAcknowledgement>(
      '/mpesa/stkpushquery/v1/query',
      payload,
    );
  }

  private async postJson<T>(path: string, body: unknown, retried = false): Promise<T> {
    const token = await this.auth.getAccessToken(retried);
    const base = getDarajaBaseUrl(this.config.env);
    const res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = (await res.json().catch(() => null)) as T & {
      errorCode?: string;
      errorMessage?: string;
      ResponseCode?: string;
    } | null;

    if (res.status === 401 && !retried) {
      this.auth.clearCache();
      return this.postJson<T>(path, body, true);
    }

    if (!res.ok) {
      throw new DarajaError(
        data?.errorMessage ?? `Daraja request failed (${res.status})`,
        data?.errorCode ?? 'REQUEST_FAILED',
        res.status,
        data,
      );
    }

    if (data && 'ResponseCode' in data && String(data.ResponseCode) !== '0') {
      throw new DarajaError(
        (data as { ResponseDescription?: string }).ResponseDescription ??
          'Daraja rejected the request',
        String(data.ResponseCode),
        res.status,
        data,
      );
    }

    return data as T;
  }
}

export function parseStkCallback(payload: unknown): ParsedStkCallback {
  const body = payload as StkCallbackBody;
  const cb = body?.Body?.stkCallback;
  if (!cb?.CheckoutRequestID) {
    throw new DarajaError('Invalid STK callback payload', 'INVALID_CALLBACK', 400, payload);
  }

  const items = cb.CallbackMetadata?.Item ?? [];
  const get = (name: string) => items.find((i) => i.Name === name)?.Value;

  const amountRaw = get('Amount');
  const phoneRaw = get('PhoneNumber');
  const receipt = get('MpesaReceiptNumber');
  const txDate = get('TransactionDate');

  return {
    merchantRequestId: cb.MerchantRequestID,
    checkoutRequestId: cb.CheckoutRequestID,
    resultCode: Number(cb.ResultCode),
    resultDesc: cb.ResultDesc,
    success: Number(cb.ResultCode) === 0,
    amount: amountRaw !== undefined ? Number(amountRaw) : undefined,
    mpesaReceiptNumber: receipt !== undefined ? String(receipt) : undefined,
    transactionDate: txDate !== undefined ? String(txDate) : undefined,
    phoneNumber: phoneRaw !== undefined ? String(phoneRaw) : undefined,
  };
}

let defaultClient: DarajaClient | null = null;

export function getDarajaClient(config?: DarajaConfig): DarajaClient {
  if (config) return new DarajaClient(config);
  if (!defaultClient) {
    defaultClient = new DarajaClient(loadDarajaConfig());
  }
  return defaultClient;
}

export function resetDarajaClient(): void {
  defaultClient = null;
}
