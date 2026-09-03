import type { PaymentProviderCapabilities } from '../domain/finance.types';
import type { PaymentProviderType, PaymentStatus } from '@prisma/client';
import { BasePaymentProvider } from './base.provider';
import type {
  AuthorizationResult,
  CaptureResult,
  PaymentProviderContext,
  RefundResult,
  WebhookResult,
} from './types';

export class CashPaymentProvider extends BasePaymentProvider {
  readonly type = 'CASH' as PaymentProviderType;
  readonly name = 'Cash';
  readonly capabilities: PaymentProviderCapabilities = {
    supportsAuthorization: false,
    supportsCapture: true,
    supportsRefund: true,
    supportsPartialRefund: true,
    supportsWebhook: false,
    supportedMethods: ['CASH'],
  };

  override async capture(): Promise<CaptureResult> {
    return { success: true, response: { method: 'CASH', captured: true } };
  }

  override async refund(): Promise<RefundResult> {
    return { success: true, response: { method: 'CASH', refunded: true } };
  }
}

export class BankTransferPaymentProvider extends BasePaymentProvider {
  readonly type = 'BANK_TRANSFER' as PaymentProviderType;
  readonly name = 'Bank Transfer';
  readonly capabilities: PaymentProviderCapabilities = {
    supportsAuthorization: false,
    supportsCapture: true,
    supportsRefund: true,
    supportsPartialRefund: true,
    supportsWebhook: false,
    supportedMethods: ['BANK_TRANSFER'],
  };

  override async capture(): Promise<CaptureResult> {
    return { success: true, response: { method: 'BANK_TRANSFER', captured: true } };
  }

  override async refund(): Promise<RefundResult> {
    return { success: true, response: { method: 'BANK_TRANSFER', refunded: true } };
  }
}

export class StripePaymentProvider extends BasePaymentProvider {
  readonly type = 'STRIPE' as PaymentProviderType;
  readonly name = 'Stripe';
  readonly capabilities: PaymentProviderCapabilities = {
    supportsAuthorization: true,
    supportsCapture: true,
    supportsRefund: true,
    supportsPartialRefund: true,
    supportsWebhook: true,
    supportedMethods: ['CARD'],
  };

  override async authorize(context: PaymentProviderContext): Promise<AuthorizationResult> {
    return {
      success: true,
      authorizationCode: `STRIPE-${Date.now()}`,
      providerPaymentId: `STRIPE-${context.intent.id}`,
    };
  }

  override async capture(): Promise<CaptureResult> {
    return { success: true, response: { method: 'STRIPE', captured: true } };
  }

  override async refund(): Promise<RefundResult> {
    return { success: true, response: { method: 'STRIPE', refunded: true } };
  }

  override async processWebhook(payload: Record<string, unknown>): Promise<WebhookResult> {
    const type = (payload.type as string) || '';
    if (type.includes('succeeded')) return { success: true, paymentStatus: 'CAPTURED' };
    if (type.includes('failed')) return { success: true, paymentStatus: 'FAILED' };
    return { success: true, paymentStatus: 'CAPTURED' };
  }
}

export class FlutterwavePaymentProvider extends BasePaymentProvider {
  readonly type = 'FLUTTERWAVE' as PaymentProviderType;
  readonly name = 'Flutterwave';
  readonly capabilities: PaymentProviderCapabilities = {
    supportsAuthorization: true,
    supportsCapture: true,
    supportsRefund: true,
    supportsPartialRefund: true,
    supportsWebhook: true,
    supportedMethods: ['CARD', 'MPESA', 'BANK_TRANSFER'],
  };

  override async authorize(context: PaymentProviderContext): Promise<AuthorizationResult> {
    return {
      success: true,
      authorizationCode: `FLW-${Date.now()}`,
      providerPaymentId: `FLW-${context.intent.id}`,
    };
  }

  override async capture(): Promise<CaptureResult> {
    return { success: true, response: { method: 'FLUTTERWAVE', captured: true } };
  }

  override async refund(): Promise<RefundResult> {
    return { success: true, response: { method: 'FLUTTERWAVE', refunded: true } };
  }

  override async processWebhook(payload: Record<string, unknown>): Promise<WebhookResult> {
    const status = (payload.status as string)?.toUpperCase();
    const mapping: Record<string, PaymentStatus> = {
      SUCCESSFUL: 'CAPTURED',
      FAILED: 'FAILED',
      CANCELLED: 'CANCELLED',
    };
    return { success: true, paymentStatus: mapping[status] || 'FAILED' };
  }
}

export class PesapalPaymentProvider extends BasePaymentProvider {
  readonly type = 'PESAPAL' as PaymentProviderType;
  readonly name = 'Pesapal';
  readonly capabilities: PaymentProviderCapabilities = {
    supportsAuthorization: true,
    supportsCapture: true,
    supportsRefund: true,
    supportsPartialRefund: true,
    supportsWebhook: true,
    supportedMethods: ['CARD', 'MPESA', 'BANK_TRANSFER'],
  };

  override async authorize(context: PaymentProviderContext): Promise<AuthorizationResult> {
    return {
      success: true,
      authorizationCode: `P3-${Date.now()}`,
      providerPaymentId: `P3-${context.intent.id}`,
    };
  }

  override async capture(): Promise<CaptureResult> {
    return { success: true, response: { method: 'PESAPAL', captured: true } };
  }

  override async refund(): Promise<RefundResult> {
    return { success: true, response: { method: 'PESAPAL', refunded: true } };
  }

  override async processWebhook(payload: Record<string, unknown>): Promise<WebhookResult> {
    const status = (payload.payment_status as string)?.toUpperCase();
    const mapping: Record<string, PaymentStatus> = {
      COMPLETED: 'CAPTURED',
      FAILED: 'FAILED',
      CANCELLED: 'CANCELLED',
      INVALID: 'FAILED',
    };
    return { success: true, paymentStatus: mapping[status] || 'FAILED' };
  }
}
