import type { PaymentProviderCapabilities } from '../domain/finance.types';
import type { PaymentStatus, PaymentProviderType } from '@prisma/client';
import type { ParsedStkCallback } from '../daraja';

export interface PaymentProviderContext {
  intent: {
    id: string;
    amount: unknown;
    currency?: string;
    intentReference?: string;
    paymentMethod?: string;
    providerType?: string;
    bookingId?: string | null;
    metadata?: unknown;
  };
  payment?: {
    id: string;
    providerPaymentId?: string | null;
    amount?: unknown;
    currency?: string;
    status?: string;
    metadata?: unknown;
  };
  metadata?: Record<string, unknown>;
}

export interface AuthorizationResult {
  success: boolean;
  authorizationCode?: string;
  providerPaymentId?: string;
  response?: unknown;
  errorCode?: string;
  errorMessage?: string;
}

export interface CaptureResult {
  success: boolean;
  providerPaymentId?: string;
  response?: unknown;
  errorCode?: string;
  errorMessage?: string;
}

export interface RefundResult {
  success: boolean;
  providerRefundId?: string;
  response?: unknown;
  errorCode?: string;
  errorMessage?: string;
}

export interface WebhookResult {
  success: boolean;
  paymentStatus: PaymentStatus;
  errorMessage?: string;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  mpesaReceiptNumber?: string;
  amount?: number;
  phoneNumber?: string;
  resultCode?: number;
  resultDesc?: string;
  raw?: ParsedStkCallback;
}

export type { PaymentProviderCapabilities, PaymentProviderType, PaymentStatus };
