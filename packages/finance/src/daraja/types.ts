export type DarajaEnv = 'sandbox' | 'production';

export type DarajaTransactionType =
  | 'CustomerPayBillOnline'
  | 'CustomerBuyGoodsOnline';

export interface DarajaConfig {
  env: DarajaEnv;
  consumerKey: string;
  consumerSecret: string;
  shortcode: string;
  passkey: string;
  callbackUrl: string;
  transactionType: DarajaTransactionType;
  /** Till number for CustomerBuyGoodsOnline (PartyB). Required for Buy Goods STK. */
  partyB?: string;
}

export interface StkPushInput {
  amount: number;
  phone: string;
  accountReference: string;
  transactionDesc?: string;
  callbackUrl?: string;
}

export interface StkPushAcknowledgement {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface StkPushQueryInput {
  checkoutRequestId: string;
}

export interface StkPushQueryAcknowledgement {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  ResultCode?: string;
  ResultDesc?: string;
}

export interface StkCallbackMetadataItem {
  Name: string;
  Value?: string | number;
}

export interface StkCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: StkCallbackMetadataItem[];
      };
    };
  };
}

export interface ParsedStkCallback {
  merchantRequestId: string;
  checkoutRequestId: string;
  resultCode: number;
  resultDesc: string;
  amount?: number;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  phoneNumber?: string;
  success: boolean;
}

export class DarajaError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly status?: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'DarajaError';
  }
}
