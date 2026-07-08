export type PaymentStatus = "PENDING" | "AUTHORIZED" | "CAPTURED" | "FAILED" | "CANCELLED" | "EXPIRED" | "REFUNDED" | "PARTIALLY_REFUNDED";
export type PaymentMethod = "CARD" | "MPESA" | "BANK_TRANSFER" | "CASH" | "WALLET" | "CORPORATE_CREDIT" | "GIFT_CARD" | "CRYPTO";
export type PaymentProviderType = "MPESA" | "STRIPE" | "FLUTTERWAVE" | "PESAPAL" | "CASH" | "BANK_TRANSFER";
export type IntentStatus = "PENDING" | "AUTHORIZED" | "CAPTURED" | "FAILED" | "CANCELLED" | "EXPIRED";
export type LedgerEntryType = "DEBIT" | "CREDIT";
export type WalletType = "CUSTOMER" | "PARTNER" | "CORPORATE" | "REWARD" | "GIFT_CARD" | "INVESTOR" | "STORE_CREDIT";
export type WalletStatus = "ACTIVE" | "FROZEN" | "CLOSED";
export type WalletTransactionType = "CREDIT" | "DEBIT" | "TRANSFER" | "EXPIRATION" | "ADJUSTMENT";
export type InvoiceStatus = "DRAFT" | "ISSUED" | "PAID" | "OVERDUE" | "CANCELLED" | "CREDITED";
export type RefundStatus = "PENDING" | "APPROVED" | "REJECTED" | "PROCESSING" | "COMPLETED" | "FAILED";
export type RefundType = "FULL" | "PARTIAL" | "MANUAL" | "AUTOMATIC";
export type SettlementStatus = "CREATED" | "APPROVED" | "PROCESSING" | "COMPLETED" | "FAILED" | "REVERSED";
export type SettlementType = "PARTNER_PAYOUT" | "SUPPLIER_PAYMENT" | "OWNER_DISTRIBUTION" | "COMMISSION";
export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
export type JournalEntryStatus = "DRAFT" | "POSTED" | "REVERSED";
export type RevenueRecognitionStatus = "PENDING" | "RECOGNIZED" | "DEFERRED";
export type TaxCategory = "VAT" | "TOURISM_LEVY" | "MARINE_CONSERVATION_FEE" | "SERVICE_CHARGE" | "COUNTY_TAX" | "PROPERTY_TAX" | "INCOME_TAX";
export type ReconciliationStatus = "PENDING" | "IN_PROGRESS" | "RECONCILED" | "DISCREPANCY" | "RESOLVED";
export type PayoutStatus = "PENDING" | "APPROVED" | "PROCESSING" | "COMPLETED" | "FAILED" | "REVERSED";

export interface Money {
  amount: number;
  currency: string;
}

export interface PaymentProviderCapabilities {
  supportsAuthorization: boolean;
  supportsCapture: boolean;
  supportsRefund: boolean;
  supportsPartialRefund: boolean;
  supportsWebhook: boolean;
  supportedMethods: PaymentMethod[];
}
