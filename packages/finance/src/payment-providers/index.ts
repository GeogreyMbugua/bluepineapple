export type {
  AuthorizationResult,
  CaptureResult,
  PaymentProviderContext,
  RefundResult,
  WebhookResult,
} from './types';

export { BasePaymentProvider } from './base.provider';
export { MpesaPaymentProvider } from './mpesa.provider';
export {
  CashPaymentProvider,
  BankTransferPaymentProvider,
  StripePaymentProvider,
  FlutterwavePaymentProvider,
  PesapalPaymentProvider,
} from './stub.providers';
export { PaymentProviderFactory } from './factory';
export type { ProviderFactoryDeps } from './factory';

/** @deprecated Prefer importing from modular files; kept for compatibility. */
export { PaymentProviderFactory as default } from './factory';
