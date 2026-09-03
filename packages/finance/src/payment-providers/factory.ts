import type { PaymentProviderType } from '@prisma/client';
import type { DarajaClient } from '../daraja';
import { getDarajaClient } from '../daraja';
import { BasePaymentProvider } from './base.provider';
import { MpesaPaymentProvider } from './mpesa.provider';
import {
  BankTransferPaymentProvider,
  CashPaymentProvider,
  FlutterwavePaymentProvider,
  PesapalPaymentProvider,
  StripePaymentProvider,
} from './stub.providers';

export type ProviderFactoryDeps = {
  daraja?: DarajaClient;
};

export class PaymentProviderFactory {
  private static providers = new Map<PaymentProviderType, new () => BasePaymentProvider>([
    ['CASH', CashPaymentProvider],
    ['BANK_TRANSFER', BankTransferPaymentProvider],
    ['STRIPE', StripePaymentProvider],
    ['FLUTTERWAVE', FlutterwavePaymentProvider],
    ['PESAPAL', PesapalPaymentProvider],
  ]);

  static create(
    providerType: PaymentProviderType,
    deps: ProviderFactoryDeps = {},
  ): BasePaymentProvider {
    if (providerType === 'MPESA') {
      return new MpesaPaymentProvider(deps.daraja ?? getDarajaClient());
    }

    const ProviderClass = this.providers.get(providerType);
    if (!ProviderClass) {
      throw new Error(`Unsupported payment provider type: ${providerType}`);
    }
    return new ProviderClass();
  }

  static register(
    providerType: PaymentProviderType,
    ProviderClass: new () => BasePaymentProvider,
  ): void {
    this.providers.set(providerType, ProviderClass);
  }
}
