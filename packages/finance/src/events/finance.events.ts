export interface PaymentIntentCreatedEvent {
  intentId: string;
  intentReference: string;
  bookingId?: string;
  customerId?: string;
  partnerId?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  providerType: string;
  status: string;
}

export interface PaymentAuthorizedEvent {
  intentId: string;
  paymentId: string;
  authorizationCode: string;
  amount: number;
  currency: string;
  providerType: string;
}

export interface PaymentCapturedEvent {
  intentId: string;
  paymentId: string;
  amount: number;
  currency: string;
  capturedAt: string;
}

export interface PaymentFailedEvent {
  intentId: string;
  paymentId?: string;
  reason: string;
  failureCode?: string;
  providerType: string;
}

export interface PaymentCancelledEvent {
  intentId: string;
  paymentId?: string;
  reason?: string;
}

export interface PaymentExpiredEvent {
  intentId: string;
  reason?: string;
}

export interface LedgerEntryPostedEvent {
  ledgerEntryId: string;
  entryReference: string;
  entryType: string;
  accountCode: string;
  amount: number;
  currency: string;
  sourceDomain: string;
  sourceEntityId: string;
  postedAt: string;
}

export interface WalletCreditedEvent {
  walletId: string;
  walletReference: string;
  walletType: string;
  amount: number;
  currency: string;
  balanceAfter: number;
  transactionReference: string;
}

export interface WalletDebitedEvent {
  walletId: string;
  walletReference: string;
  walletType: string;
  amount: number;
  currency: string;
  balanceAfter: number;
  transactionReference: string;
}

export interface InvoiceIssuedEvent {
  invoiceId: string;
  invoiceReference: string;
  bookingId?: string;
  customerId?: string;
  partnerId?: string;
  grandTotal: number;
  currency: string;
  dueAt: string;
}

export interface InvoiceCancelledEvent {
  invoiceId: string;
  invoiceReference: string;
  reason?: string;
}

export interface FinanceRefundRequestedEvent {
  financeRefundRequestId: string;
  requestReference: string;
  paymentId: string;
  amount: number;
  currency: string;
  reason: string;
}

export interface FinanceRefundApprovedEvent {
  financeRefundRequestId: string;
  refundId: string;
  paymentId: string;
  amount: number;
  currency: string;
}

export interface FinanceRefundCompletedEvent {
  refundId: string;
  refundReference: string;
  paymentId: string;
  amount: number;
  currency: string;
  providerRefundId?: string;
}

export interface FinanceRefundFailedEvent {
  refundId: string;
  paymentId: string;
  reason: string;
}

export interface SettlementCreatedEvent {
  settlementId: string;
  settlementReference: string;
  settlementType: string;
  totalAmount: number;
  currency: string;
  recipientId?: string;
}

export interface SettlementApprovedEvent {
  settlementId: string;
  settlementReference: string;
}

export interface SettlementCompletedEvent {
  settlementId: string;
  settlementReference: string;
  processedAt: string;
}

export interface SettlementFailedEvent {
  settlementId: string;
  settlementReference: string;
  reason: string;
}

export interface JournalEntryCreatedEvent {
  journalEntryId: string;
  journalReference: string;
  description: string;
  totalDebit: number;
  totalCredit: number;
  entryDate: string;
}

export interface JournalEntryPostedEvent {
  journalEntryId: string;
  journalReference: string;
  postedAt: string;
}

export interface RevenueRecognizedEvent {
  revenueRecognitionId: string;
  recognitionReference: string;
  invoiceId?: string;
  recognizedAmount: number;
  currency: string;
  eventDate: string;
}

export interface RevenueDeferredEvent {
  revenueRecognitionId: string;
  recognitionReference: string;
  invoiceId?: string;
  deferredAmount: number;
  currency: string;
  deferredAt: string;
}

export interface TaxPostedEvent {
  taxLedgerEntryId: string;
  taxCategory: string;
  taxableAmount: number;
  taxAmount: number;
  currency: string;
  sourceEntityId: string;
  postedAt: string;
}

export interface CommissionSettledEvent {
  commissionSettlementId: string;
  commissionReference: string;
  partnerId: string;
  commissionAmount: number;
  currency: string;
  paidAt?: string;
}

export interface ReconciliationStartedEvent {
  batchId: string;
  batchReference: string;
  batchType: string;
}

export interface ReconciliationCompletedEvent {
  batchId: string;
  batchReference: string;
  varianceCount: number;
  varianceAmount: number;
  reconciledAt: string;
}

export interface PayoutCreatedEvent {
  payoutId: string;
  payoutReference: string;
  payoutType: string;
  amount: number;
  currency: string;
  recipientId: string;
}

export interface PayoutProcessedEvent {
  payoutId: string;
  payoutReference: string;
  processedAt: string;
}

export interface PayoutCompletedEvent {
  payoutId: string;
  payoutReference: string;
  completedAt: string;
}

export interface PayoutFailedEvent {
  payoutId: string;
  payoutReference: string;
  reason: string;
}
