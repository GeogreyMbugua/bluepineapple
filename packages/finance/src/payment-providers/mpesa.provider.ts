import type { PaymentProviderCapabilities } from '../domain/finance.types';
import type { PaymentProviderType, PaymentStatus } from '@prisma/client';
import {
  DarajaError,
  normalizeMsisdn,
  parseStkCallback,
  truncateAccountReference,
  type DarajaClient,
} from '../daraja';
import { getDarajaClient } from '../daraja';
import { STK_CANCEL_RESULT_CODES } from '../mpesa/callback.schema';
import { BasePaymentProvider } from './base.provider';
import type {
  AuthorizationResult,
  CaptureResult,
  PaymentProviderContext,
  RefundResult,
  WebhookResult,
} from './types';

/**
 * M-Pesa Express (STK Push) adapter.
 * authorize() queues a PIN prompt; capture is applied from the async callback.
 */
export class MpesaPaymentProvider extends BasePaymentProvider {
  readonly type = 'MPESA' as PaymentProviderType;
  readonly name = 'M-Pesa';
  readonly capabilities: PaymentProviderCapabilities = {
    supportsAuthorization: true,
    supportsCapture: true,
    supportsRefund: false,
    supportsPartialRefund: false,
    supportsWebhook: true,
    supportedMethods: ['MPESA'],
  };

  private _daraja?: DarajaClient;

  constructor(daraja?: DarajaClient) {
    super();
    this._daraja = daraja;
  }

  private get daraja(): DarajaClient {
    return (this._daraja ??= getDarajaClient());
  }

  override async authorize(context: PaymentProviderContext): Promise<AuthorizationResult> {
    const start = Date.now();
    const phone = String(context.metadata?.phone ?? '');
    const accountReference = truncateAccountReference(
      String(
        context.metadata?.accountReference ??
          context.intent.intentReference ??
          context.intent.id ??
          'BOOKING',
      ),
    );
    const transactionDesc = String(context.metadata?.transactionDesc ?? 'Payment');
    const amount = Math.round(Number(context.intent.amount));

    if (!Number.isFinite(amount) || amount < 1) {
      return {
        success: false,
        errorCode: 'INVALID_AMOUNT',
        errorMessage: 'STK amount must be a whole number of KES >= 1',
      };
    }

    try {
      const msisdn = normalizeMsisdn(phone);
      const ack = await this.daraja.stkPush({
        amount,
        phone: msisdn,
        accountReference,
        transactionDesc,
      });

      await this.recordResponse({
        paymentIntentId: context.intent.id,
        paymentId: context.payment?.id,
        requestPayload: { amount, phone: msisdn, accountReference, transactionDesc },
        responsePayload: ack,
        isSuccess: true,
        httpStatusCode: 200,
        latencyMs: Date.now() - start,
        providerPaymentId: ack.CheckoutRequestID,
      });

      return {
        success: true,
        authorizationCode: ack.MerchantRequestID,
        providerPaymentId: ack.CheckoutRequestID,
        response: ack,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'STK Push failed';
      const code = error instanceof DarajaError ? error.code : 'STK_FAILED';

      await this.recordResponse({
        paymentIntentId: context.intent.id,
        paymentId: context.payment?.id,
        requestPayload: { amount, phone, accountReference },
        responsePayload: error instanceof DarajaError ? error.details : { message },
        isSuccess: false,
        errorCode: code,
        errorMessage: message,
        httpStatusCode: error instanceof DarajaError ? (error.status ?? 500) : 500,
        latencyMs: Date.now() - start,
      });

      return {
        success: false,
        errorCode: code,
        errorMessage: message,
        response: error instanceof DarajaError ? error.details : undefined,
      };
    }
  }

  override async capture(context: PaymentProviderContext): Promise<CaptureResult> {
    return {
      success: true,
      providerPaymentId: context.payment?.providerPaymentId ?? undefined,
      response: context.metadata ?? { method: 'MPESA', captured: true },
    };
  }

  override async refund(): Promise<RefundResult> {
    return {
      success: false,
      errorCode: 'NOT_IMPLEMENTED',
      errorMessage: 'M-Pesa Express refunds require the Reversal API',
    };
  }

  override async processWebhook(payload: Record<string, unknown>): Promise<WebhookResult> {
    const parsed = parseStkCallback(payload);

    if (!parsed.success) {
      const cancelled =
        parsed.resultCode === 1032 ||
        parsed.resultCode === 1037 ||
        STK_CANCEL_RESULT_CODES.has(parsed.resultCode);
      return {
        success: true,
        paymentStatus: (cancelled ? 'CANCELLED' : 'FAILED') as PaymentStatus,
        errorMessage: parsed.resultDesc,
        checkoutRequestId: parsed.checkoutRequestId,
        merchantRequestId: parsed.merchantRequestId,
        resultCode: parsed.resultCode,
        resultDesc: parsed.resultDesc,
        raw: parsed,
      };
    }

    return {
      success: true,
      paymentStatus: 'CAPTURED',
      checkoutRequestId: parsed.checkoutRequestId,
      merchantRequestId: parsed.merchantRequestId,
      mpesaReceiptNumber: parsed.mpesaReceiptNumber,
      amount: parsed.amount,
      phoneNumber: parsed.phoneNumber,
      resultCode: parsed.resultCode,
      resultDesc: parsed.resultDesc,
      raw: parsed,
    };
  }
}
