import type { PaymentProviderCapabilities } from "../domain/finance.types";
import type { PaymentStatus, PaymentProviderType } from "@prisma/client";

export interface PaymentProviderContext {
  intent: any;
  payment?: any;
  metadata?: Record<string, unknown>;
}

export interface AuthorizationResult {
  success: boolean;
  authorizationCode?: string;
  providerPaymentId?: string;
  response?: any;
  errorCode?: string;
  errorMessage?: string;
}

export interface CaptureResult {
  success: boolean;
  providerPaymentId?: string;
  response?: any;
  errorCode?: string;
  errorMessage?: string;
}

export interface RefundResult {
  success: boolean;
  providerRefundId?: string;
  response?: any;
  errorCode?: string;
  errorMessage?: string;
}

export interface WebhookResult {
  success: boolean;
  paymentStatus: PaymentStatus;
  errorMessage?: string;
}

export abstract class BasePaymentProvider {
  abstract readonly type: PaymentProviderType;
  abstract readonly name: string;
  abstract readonly capabilities: PaymentProviderCapabilities;

  async authorize(_context: PaymentProviderContext): Promise<AuthorizationResult> {
    throw new Error("Provider does not support authorization");
  }

  async capture(_context: PaymentProviderContext): Promise<CaptureResult> {
    throw new Error("Provider does not support capture");
  }

  async refund(_context: { payment: any; amount: number; reason: string }): Promise<RefundResult> {
    throw new Error("Provider does not support refunds");
  }

  async processWebhook(_payload: Record<string, unknown>, _signature?: string): Promise<WebhookResult> {
    throw new Error("Provider does not support webhooks");
  }

  protected async recordResponse(data: {
    paymentIntentId?: string;
    paymentId?: string;
    providerId?: string;
    requestPayload: any;
    responsePayload: any;
    isSuccess: boolean;
    errorCode?: string;
    errorMessage?: string;
    httpStatusCode: number;
    latencyMs: number;
  }): Promise<void> {
    const { paymentProviderResponseRepository } = require("@blue-pineapple/database");
    await paymentProviderResponseRepository.create({
      paymentIntentId: data.paymentIntentId,
      paymentId: data.paymentId,
      providerId: data.providerId,
      providerName: this.name,
      providerPaymentId: data.responsePayload?.id || data.responsePayload?.paymentId,
      requestPayload: data.requestPayload as any,
      responsePayload: data.responsePayload as any,
      isSuccess: data.isSuccess,
      errorCode: data.errorCode,
      errorMessage: data.errorMessage,
      httpStatusCode: data.httpStatusCode,
      latencyMs: data.latencyMs,
    });
  }
}

export class CashPaymentProvider extends BasePaymentProvider {
  readonly type = "CASH" as PaymentProviderType;
  readonly name = "Cash";
  readonly capabilities: PaymentProviderCapabilities = {
    supportsAuthorization: false,
    supportsCapture: true,
    supportsRefund: true,
    supportsPartialRefund: true,
    supportsWebhook: false,
    supportedMethods: ["CASH"],
  };

  override async capture(_context: PaymentProviderContext): Promise<CaptureResult> {
    return { success: true, response: { method: "CASH", captured: true } };
  }

  override async refund(_context: { payment: any; amount: number; reason: string }): Promise<RefundResult> {
    return { success: true, response: { method: "CASH", refunded: true } };
  }
}

export class BankTransferPaymentProvider extends BasePaymentProvider {
  readonly type = "BANK_TRANSFER" as PaymentProviderType;
  readonly name = "Bank Transfer";
  readonly capabilities: PaymentProviderCapabilities = {
    supportsAuthorization: false,
    supportsCapture: true,
    supportsRefund: true,
    supportsPartialRefund: true,
    supportsWebhook: false,
    supportedMethods: ["BANK_TRANSFER"],
  };

  override async capture(_context: PaymentProviderContext): Promise<CaptureResult> {
    return { success: true, response: { method: "BANK_TRANSFER", captured: true } };
  }

  override async refund(_context: { payment: any; amount: number; reason: string }): Promise<RefundResult> {
    return { success: true, response: { method: "BANK_TRANSFER", refunded: true } };
  }
}

export class MpesaPaymentProvider extends BasePaymentProvider {
  readonly type = "MPESA" as PaymentProviderType;
  readonly name = "M-Pesa";
  readonly capabilities: PaymentProviderCapabilities = {
    supportsAuthorization: true,
    supportsCapture: true,
    supportsRefund: true,
    supportsPartialRefund: true,
    supportsWebhook: true,
    supportedMethods: ["MPESA", "CARD"],
  };

  override async authorize(context: PaymentProviderContext): Promise<AuthorizationResult> {
    return {
      success: true,
      authorizationCode: `MPESA-${Date.now()}`,
      providerPaymentId: `MPESA-${context.intent.id}`,
    };
  }

  override async capture(_context: PaymentProviderContext): Promise<CaptureResult> {
    return { success: true, response: { method: "MPESA", captured: true } };
  }

  override async refund(_context: { payment: any; amount: number; reason: string }): Promise<RefundResult> {
    return { success: true, response: { method: "MPESA", refunded: true } };
  }

  override async processWebhook(_payload: Record<string, unknown>): Promise<WebhookResult> {
    const status = (_payload.status as string)?.toUpperCase();
    const mapping: Record<string, PaymentStatus> = {
      SUCCESS: "CAPTURED",
      FAILED: "FAILED",
      CANCELLED: "CANCELLED",
      TIMEOUT: "FAILED",
    };
    return { success: true, paymentStatus: mapping[status] || "FAILED" };
  }
}

export class StripePaymentProvider extends BasePaymentProvider {
  readonly type = "STRIPE" as PaymentProviderType;
  readonly name = "Stripe";
  readonly capabilities: PaymentProviderCapabilities = {
    supportsAuthorization: true,
    supportsCapture: true,
    supportsRefund: true,
    supportsPartialRefund: true,
    supportsWebhook: true,
    supportedMethods: ["CARD"],
  };

  override async authorize(context: PaymentProviderContext): Promise<AuthorizationResult> {
    return {
      success: true,
      authorizationCode: `STRIPE-${Date.now()}`,
      providerPaymentId: `STRIPE-${context.intent.id}`,
    };
  }

  override async capture(_context: PaymentProviderContext): Promise<CaptureResult> {
    return { success: true, response: { method: "STRIPE", captured: true } };
  }

  override async refund(_context: { payment: any; amount: number; reason: string }): Promise<RefundResult> {
    return { success: true, response: { method: "STRIPE", refunded: true } };
  }

  override async processWebhook(_payload: Record<string, unknown>): Promise<WebhookResult> {
    const type = (_payload.type as string) || "";
    if (type.includes("succeeded")) return { success: true, paymentStatus: "CAPTURED" };
    if (type.includes("failed")) return { success: true, paymentStatus: "FAILED" };
    return { success: true, paymentStatus: "CAPTURED" };
  }
}

export class FlutterwavePaymentProvider extends BasePaymentProvider {
  readonly type = "FLUTTERWAVE" as PaymentProviderType;
  readonly name = "Flutterwave";
  readonly capabilities: PaymentProviderCapabilities = {
    supportsAuthorization: true,
    supportsCapture: true,
    supportsRefund: true,
    supportsPartialRefund: true,
    supportsWebhook: true,
    supportedMethods: ["CARD", "MPESA", "BANK_TRANSFER"],
  };

  override async authorize(context: PaymentProviderContext): Promise<AuthorizationResult> {
    return {
      success: true,
      authorizationCode: `FLW-${Date.now()}`,
      providerPaymentId: `FLW-${context.intent.id}`,
    };
  }

  override async capture(_context: PaymentProviderContext): Promise<CaptureResult> {
    return { success: true, response: { method: "FLUTTERWAVE", captured: true } };
  }

  override async refund(_context: { payment: any; amount: number; reason: string }): Promise<RefundResult> {
    return { success: true, response: { method: "FLUTTERWAVE", refunded: true } };
  }

  override async processWebhook(_payload: Record<string, unknown>): Promise<WebhookResult> {
    const status = (_payload.status as string)?.toUpperCase();
    const mapping: Record<string, PaymentStatus> = {
      SUCCESSFUL: "CAPTURED",
      FAILED: "FAILED",
      CANCELLED: "CANCELLED",
    };
    return { success: true, paymentStatus: mapping[status] || "FAILED" };
  }
}

export class PesapalPaymentProvider extends BasePaymentProvider {
  readonly type = "PESAPAL" as PaymentProviderType;
  readonly name = "Pesapal";
  readonly capabilities: PaymentProviderCapabilities = {
    supportsAuthorization: true,
    supportsCapture: true,
    supportsRefund: true,
    supportsPartialRefund: true,
    supportsWebhook: true,
    supportedMethods: ["CARD", "MPESA", "BANK_TRANSFER"],
  };

  override async authorize(context: PaymentProviderContext): Promise<AuthorizationResult> {
    return {
      success: true,
      authorizationCode: `P3-${Date.now()}`,
      providerPaymentId: `P3-${context.intent.id}`,
    };
  }

  override async capture(_context: PaymentProviderContext): Promise<CaptureResult> {
    return { success: true, response: { method: "PESAPAL", captured: true } };
  }

  override async refund(_context: { payment: any; amount: number; reason: string }): Promise<RefundResult> {
    return { success: true, response: { method: "PESAPAL", refunded: true } };
  }

  override async processWebhook(_payload: Record<string, unknown>): Promise<WebhookResult> {
    const status = (_payload.payment_status as string)?.toUpperCase();
    const mapping: Record<string, PaymentStatus> = {
      COMPLETED: "CAPTURED",
      FAILED: "FAILED",
      CANCELLED: "CANCELLED",
      INVALID: "FAILED",
    };
    return { success: true, paymentStatus: mapping[status] || "FAILED" };
  }
}

export class PaymentProviderFactory {
  private static providers = new Map<PaymentProviderType, new () => BasePaymentProvider>([
    ["CASH", CashPaymentProvider],
    ["BANK_TRANSFER", BankTransferPaymentProvider],
    ["MPESA", MpesaPaymentProvider],
    ["STRIPE", StripePaymentProvider],
    ["FLUTTERWAVE", FlutterwavePaymentProvider],
    ["PESAPAL", PesapalPaymentProvider],
  ]);

  static create(providerType: PaymentProviderType): BasePaymentProvider {
    const ProviderClass = this.providers.get(providerType);
    if (!ProviderClass) {
      throw new Error(`Unsupported payment provider type: ${providerType}`);
    }
    return new ProviderClass();
  }

  static register(providerType: PaymentProviderType, ProviderClass: new () => BasePaymentProvider): void {
    this.providers.set(providerType, ProviderClass);
  }
}
