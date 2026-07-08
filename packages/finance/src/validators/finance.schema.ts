import { z } from "zod";

export const PaymentMethodSchema = z.enum([
  "CARD",
  "MPESA",
  "BANK_TRANSFER",
  "CASH",
  "WALLET",
  "CORPORATE_CREDIT",
  "GIFT_CARD",
]);

export const PaymentProviderTypeSchema = z.enum([
  "MPESA",
  "STRIPE",
  "FLUTTERWAVE",
  "PESAPAL",
  "CASH",
  "BANK_TRANSFER",
]);

export const IntentStatusSchema = z.enum([
  "PENDING",
  "AUTHORIZED",
  "CAPTURED",
  "FAILED",
  "CANCELLED",
  "EXPIRED",
]);

export const PaymentStatusSchema = z.enum([
  "PENDING",
  "AUTHORIZED",
  "CAPTURED",
  "FAILED",
  "CANCELLED",
  "EXPIRED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
]);

export const LedgerEntryTypeSchema = z.enum(["DEBIT", "CREDIT"]);

export const WalletTypeSchema = z.enum([
  "CUSTOMER",
  "PARTNER",
  "CORPORATE",
  "REWARD",
  "GIFT_CARD",
  "INVESTOR",
  "STORE_CREDIT",
]);

export const WalletStatusSchema = z.enum(["ACTIVE", "FROZEN", "CLOSED"]);

export const WalletTransactionTypeSchema = z.enum([
  "CREDIT",
  "DEBIT",
  "TRANSFER",
  "EXPIRATION",
  "ADJUSTMENT",
]);

export const InvoiceStatusSchema = z.enum([
  "DRAFT",
  "ISSUED",
  "PAID",
  "OVERDUE",
  "CANCELLED",
  "CREDITED",
]);

export const RefundStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);

export const RefundTypeSchema = z.enum([
  "FULL",
  "PARTIAL",
  "MANUAL",
  "AUTOMATIC",
]);

export const SettlementStatusSchema = z.enum([
  "CREATED",
  "APPROVED",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "REVERSED",
]);

export const SettlementTypeSchema = z.enum([
  "PARTNER_PAYOUT",
  "SUPPLIER_PAYMENT",
  "OWNER_DISTRIBUTION",
  "COMMISSION",
]);

export const AccountTypeSchema = z.enum([
  "ASSET",
  "LIABILITY",
  "EQUITY",
  "REVENUE",
  "EXPENSE",
]);

export const JournalEntryStatusSchema = z.enum([
  "DRAFT",
  "POSTED",
  "REVERSED",
]);

export const RevenueRecognitionStatusSchema = z.enum([
  "PENDING",
  "RECOGNIZED",
  "DEFERRED",
]);

export const TaxCategorySchema = z.enum([
  "VAT",
  "TOURISM_LEVY",
  "MARINE_CONSERVATION_FEE",
  "SERVICE_CHARGE",
  "COUNTY_TAX",
  "PROPERTY_TAX",
  "INCOME_TAX",
]);

export const ReconciliationStatusSchema = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "RECONCILED",
  "DISCREPANCY",
  "RESOLVED",
]);

export const PayoutStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "REVERSED",
]);

export const CreatePaymentIntentSchema = z.object({
  bookingId: z.string().uuid().optional().nullable(),
  commercialSummaryId: z.string().uuid().optional().nullable(),
  customerId: z.string().uuid().optional().nullable(),
  partnerId: z.string().uuid().optional().nullable(),
  amount: z.number().positive(),
  currency: z.string().length(3).default("KES"),
  paymentMethod: PaymentMethodSchema,
  providerType: PaymentProviderTypeSchema,
  idempotencyKey: z.string().optional().nullable(),
  correlationId: z.string().uuid().optional().nullable(),
  expiresInMinutes: z.number().int().min(5).max(10080).default(30),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const CreatePaymentSchema = z.object({
  intentId: z.string().uuid(),
  providerId: z.string().uuid().optional().nullable(),
  amount: z.number().positive(),
  currency: z.string().length(3).default("KES"),
  providerPaymentId: z.string().optional().nullable(),
  authorizationCode: z.string().optional().nullable(),
  providerResponse: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const CapturePaymentSchema = z.object({
  paymentId: z.string().uuid(),
  amount: z.number().positive().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const CreateWalletSchema = z.object({
  walletType: WalletTypeSchema,
  ownerId: z.string().uuid(),
  ownerType: z.string().min(1).max(50),
  currency: z.string().length(3).default("KES"),
  expiresInDays: z.number().int().min(1).optional().nullable(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const WalletTransactionSchema = z.object({
  walletId: z.string().uuid(),
  transactionType: WalletTransactionTypeSchema,
  amount: z.number().positive(),
  currency: z.string().length(3).default("KES"),
  relatedWalletId: z.string().uuid().optional().nullable(),
  relatedPaymentId: z.string().uuid().optional().nullable(),
  relatedInvoiceId: z.string().uuid().optional().nullable(),
  relatedSettlementId: z.string().uuid().optional().nullable(),
  relatedRefundId: z.string().uuid().optional().nullable(),
  description: z.string().min(1).max(500),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const CreateInvoiceSchema = z.object({
  bookingId: z.string().uuid().optional().nullable(),
  quoteId: z.string().uuid().optional().nullable(),
  customerId: z.string().uuid().optional().nullable(),
  partnerId: z.string().uuid().optional().nullable(),
  commercialSummaryId: z.string().uuid().optional().nullable(),
  items: z.array(
    z.object({
      description: z.string().min(1).max(500),
      quantity: z.number().int().min(1).default(1),
      unitPrice: z.number().nonnegative(),
      currency: z.string().length(3).default("KES"),
      taxRate: z.number().nonnegative().optional().nullable(),
      discountAmount: z.number().nonnegative().optional().nullable(),
      itemType: z.string().min(1).max(100),
      referenceId: z.string().uuid().optional().nullable(),
    })
  ).min(1),
  dueInDays: z.number().int().min(1).max(365).default(30),
  notes: z.string().max(5000).optional().nullable(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const CreateRefundSchema = z.object({
  paymentId: z.string().uuid(),
  invoiceId: z.string().uuid().optional().nullable(),
  customerId: z.string().uuid().optional().nullable(),
  partnerId: z.string().uuid().optional().nullable(),
  amount: z.number().positive(),
  currency: z.string().length(3).default("KES"),
  refundType: RefundTypeSchema.default("FULL"),
  reason: z.string().min(1).max(1000),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const CreateSettlementSchema = z.object({
  settlementType: SettlementTypeSchema,
  partnerId: z.string().uuid().optional().nullable(),
  recipientName: z.string().min(1).max(200),
  recipientAccount: z.string().min(1).max(100),
  bankName: z.string().max(100).optional().nullable(),
  items: z.array(
    z.object({
      entityType: z.string().min(1).max(100),
      entityId: z.string().uuid(),
      amount: z.number().positive(),
      currency: z.string().length(3).default("KES"),
      feeAmount: z.number().nonnegative().default(0),
      description: z.string().max(500).optional().nullable(),
      metadata: z.record(z.string(), z.any()).optional(),
    })
  ).min(1),
  description: z.string().max(1000).optional().nullable(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const CreateAccountSchema = z.object({
  accountCode: z.string().min(1).max(20),
  accountName: z.string().min(1).max(200),
  accountType: AccountTypeSchema,
  parentCode: z.string().max(20).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  currency: z.string().length(3).default("KES"),
  isPosting: z.boolean().default(true),
});

export const CreateJournalEntrySchema = z.object({
  journalReference: z.string().min(1).max(50).optional(),
  description: z.string().min(1).max(1000),
  entryDate: z.coerce.date(),
  fiscalPeriodId: z.string().uuid().optional().nullable(),
  items: z.array(
    z.object({
      accountId: z.string().uuid(),
      entryType: LedgerEntryTypeSchema,
      debitAmount: z.number().nonnegative().optional().nullable(),
      creditAmount: z.number().nonnegative().optional().nullable(),
      currency: z.string().length(3).default("KES"),
      description: z.string().max(500).optional().nullable(),
      metadata: z.record(z.string(), z.any()).optional(),
    })
  ).min(2),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const CreateRevenueRecognitionSchema = z.object({
  invoiceId: z.string().uuid().optional().nullable(),
  paymentId: z.string().uuid().optional().nullable(),
  contractValue: z.number().positive(),
  currency: z.string().length(3).default("KES"),
  recognitionSchedule: z.record(z.string(), z.any()).optional(),
  deferredAt: z.coerce.date().optional().nullable(),
});

export const CreateTaxLedgerEntrySchema = z.object({
  taxCategory: TaxCategorySchema,
  taxRuleId: z.string().uuid().optional().nullable(),
  taxableAmount: z.number().nonnegative(),
  taxAmount: z.number().nonnegative(),
  currency: z.string().length(3).default("KES"),
  rate: z.number().nonnegative(),
  isInclusive: z.boolean().default(false),
  jurisdiction: z.string().min(1).max(100),
  sourceDomain: z.string().min(1).max(100),
  sourceEntityId: z.string().uuid(),
  sourceEntityType: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const CreateCommissionSettlementSchema = z.object({
  partnerId: z.string().uuid(),
  commissionRuleId: z.string().uuid().optional().nullable(),
  bookingId: z.string().uuid().optional().nullable(),
  baseAmount: z.number().positive(),
  commissionAmount: z.number().positive(),
  currency: z.string().length(3).default("KES"),
  rate: z.number().nonnegative(),
});

export const CreateReconciliationBatchSchema = z.object({
  batchType: z.string().min(1).max(100),
  providerStatement: z.record(z.string(), z.any()).optional(),
  ledgerStatement: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const CreatePayoutSchema = z.object({
  payoutType: z.string().min(1).max(100),
  recipientId: z.string().uuid(),
  recipientType: z.string().min(1).max(50),
  amount: z.number().positive(),
  currency: z.string().length(3).default("KES"),
  fee: z.number().nonnegative().default(0),
  settlementId: z.string().uuid().optional().nullable(),
  items: z.array(
    z.object({
      entityType: z.string().min(1).max(100),
      entityId: z.string().uuid(),
      amount: z.number().positive(),
      currency: z.string().length(3).default("KES"),
      description: z.string().max(500).optional().nullable(),
      metadata: z.record(z.string(), z.any()).optional(),
    })
  ).min(1),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const CreatePaymentProviderSchema = z.object({
  type: PaymentProviderTypeSchema,
  name: z.string().min(1).max(200),
  config: z.record(z.string(), z.any()).optional(),
  priority: z.number().int().min(0).default(0),
});
