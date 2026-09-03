import type { PaymentProviderCapabilities, PaymentProviderType } from '../domain/finance.types';
import type {
  AuthorizationResult,
  CaptureResult,
  PaymentProviderContext,
  RefundResult,
  WebhookResult,
} from './types';

export abstract class BasePaymentProvider {
  abstract readonly type: PaymentProviderType;
  abstract readonly name: string;
  abstract readonly capabilities: PaymentProviderCapabilities;

  async authorize(_context: PaymentProviderContext): Promise<AuthorizationResult> {
    throw new Error('Provider does not support authorization');
  }

  async capture(_context: PaymentProviderContext): Promise<CaptureResult> {
    throw new Error('Provider does not support capture');
  }

  async refund(_context: { payment: unknown; amount: number; reason: string }): Promise<RefundResult> {
    throw new Error('Provider does not support refunds');
  }

  async processWebhook(
    _payload: Record<string, unknown>,
    _signature?: string,
  ): Promise<WebhookResult> {
    throw new Error('Provider does not support webhooks');
  }

  protected async recordResponse(data: {
    paymentIntentId?: string;
    paymentId?: string;
    providerId?: string;
    requestPayload: unknown;
    responsePayload: unknown;
    isSuccess: boolean;
    errorCode?: string;
    errorMessage?: string;
    httpStatusCode: number;
    latencyMs: number;
    providerPaymentId?: string;
  }): Promise<void> {
    const { paymentProviderResponseRepository } = await import('@blue-pineapple/database');
    const responsePayload = data.responsePayload as Record<string, unknown> | null;
    await paymentProviderResponseRepository.create({
      ...(data.paymentIntentId
        ? { paymentIntent: { connect: { id: data.paymentIntentId } } }
        : {}),
      ...(data.paymentId ? { payment: { connect: { id: data.paymentId } } } : {}),
      ...(data.providerId ? { provider: { connect: { id: data.providerId } } } : {}),
      providerName: this.name,
      providerPaymentId:
        data.providerPaymentId ||
        (typeof responsePayload?.CheckoutRequestID === 'string'
          ? responsePayload.CheckoutRequestID
          : undefined) ||
        (typeof responsePayload?.id === 'string' ? responsePayload.id : undefined),
      requestPayload: data.requestPayload as object,
      responsePayload: data.responsePayload as object,
      isSuccess: data.isSuccess,
      errorCode: data.errorCode,
      errorMessage: data.errorMessage,
      httpStatusCode: data.httpStatusCode,
      latencyMs: data.latencyMs,
    });
  }
}
