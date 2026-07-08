export interface UserCreatedEvent {
  userId: string;
  email?: string;
  phone?: string;
}

export interface UserSuspendedEvent {
  userId: string;
  reason?: string;
}

export interface UserTerminatedEvent {
  userId: string;
  reason?: string;
}

export interface UserActivatedEvent {
  userId: string;
}

export interface UserVerifiedEvent {
  userId: string;
  method: "email" | "phone";
}

export interface RoleAssignedEvent {
  userId: string;
  role: string;
  assignedBy: string;
}

export interface RoleRemovedEvent {
  userId: string;
  role: string;
  removedBy: string;
}

export interface SessionCreatedEvent {
  userId: string;
  sessionId: string;
  expiresAt: string;
}

export interface SessionRevokedEvent {
  userId: string;
  sessionId: string;
  reason: string;
}

export interface SessionRevokedAllEvent {
  userId: string;
  scenario: string;
  reason?: string;
}

export interface OtpSentEvent {
  userId: string;
  identifier: string;
  purpose: string;
  channel: string;
}

export interface OtpVerifiedEvent {
  userId: string;
  purpose: string;
}

export interface PartnerActivatedEvent {
  partnerId: string;
  userId: string;
}

export interface PartnerSuspendedEvent {
  partnerId: string;
  userId: string;
  reason?: string;
}

export interface PartnerTerminatedEvent {
  partnerId: string;
  userId: string;
  reason?: string;
}

export interface PartnerCreatedEvent {
  partnerId: string;
  userId: string;
  partnerCode: string;
}

export interface PayoutAccountAddedEvent {
  partnerId: string;
  accountId: string;
}

export interface PayoutAccountRemovedEvent {
  partnerId: string;
  accountId: string;
}

export interface ExperienceCreatedEvent {
  experienceId: string;
  name: string;
  slug: string;
  category: string;
}

export interface ExperienceUpdatedEvent {
  experienceId: string;
}

export interface ExperienceActivatedEvent {
  experienceId: string;
}

export interface ExperienceDeactivatedEvent {
  experienceId: string;
}

export interface RouteCreatedEvent {
  routeId: string;
  routeCode: string;
  routeName: string;
}

export interface RouteUpdatedEvent {
  routeId: string;
  routeCode: string;
}

export interface RouteArchivedEvent {
  routeId: string;
  routeCode: string;
}

export interface StopAssignedEvent {
  routeId: string;
  stopId: string;
  stopName: string;
  sequence: number;
}

export interface StopReorderedEvent {
  routeId: string;
  oldSequence: number;
  newSequence: number;
}

export interface VesselActivatedEvent {
  vesselId: string;
  vesselName: string;
}

export interface VesselDeactivatedEvent {
  vesselId: string;
  vesselName: string;
}

export interface VesselDecommissionedEvent {
  vesselId: string;
  vesselName: string;
}

export interface VesselCreatedEvent {
  vesselId: string;
  vesselName: string;
  registration?: string;
}

export interface VesselUpdatedEvent {
  vesselId: string;
  vesselName: string;
}

export interface VesselMaintenanceScheduledEvent {
  vesselId: string;
  vesselName: string;
  maintenanceLogId: string;
  performedAt: string;
}

export interface VesselMaintenanceCompletedEvent {
  vesselId: string;
  vesselName: string;
  maintenanceLogId: string;
}

export interface DepartureCreatedEvent {
  departureId: string;
  experienceId: string;
  routeId: string;
  vesselId: string;
  departureDateTime: string;
}

export interface DeparturePublishedEvent {
  departureId: string;
}

export interface DepartureCancelledEvent {
  departureId: string;
}

export interface DepartureRescheduledEvent {
  departureId: string;
  oldDateTime: string;
  newDateTime: string;
}

export interface DepartureClosedEvent {
  departureId: string;
}

export interface DepartureAssignedEvent {
  departureId: string;
  vesselId?: string;
  routeId?: string;
  experienceId?: string;
}

export interface DepartureUpdatedEvent {
  departureId: string;
}

export interface GuestCreatedEvent {
  guestId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export interface GuestUpdatedEvent {
  guestId: string;
}

export interface GuestMergedEvent {
  guestId: string;
  mergedWithId: string;
}

export interface BookingCreatedEvent {
  bookingId: string;
  bookingReference: string;
  departureId: string;
  partnerId: string;
  guestId?: string;
  totalGuests: number;
  status: string;
}

export interface BookingCancelledEvent {
  bookingId: string;
  bookingReference: string;
  departureId: string;
  reason?: string;
}

export interface BookingCompletedEvent {
  bookingId: string;
  bookingReference: string;
  partnerId: string;
}

export interface BookingStatusChangedEvent {
  bookingId: string;
  oldStatus: string;
  newStatus: string;
}

export interface BookingConfirmedEvent {
  bookingId: string;
  bookingReference: string;
}

export interface RewardCreatedEvent {
  rewardId: string;
  bookingId: string;
  partnerId: string;
  pointsEarned: number;
  cashValue: number;
}

export interface RewardPaidEvent {
  rewardId: string;
  partnerId: string;
  pointsEarned: number;
  cashValue: number;
}

export interface RewardReversedEvent {
  rewardId: string;
  partnerId: string;
  reason?: string;
}

export interface RewardRuleCreatedEvent {
  ruleId: string;
  ruleName: string;
  version: number;
}

export interface RewardRuleUpdatedEvent {
  ruleId: string;
  ruleName: string;
  version: number;
}

//
// OPERATIONS DOMAIN EVENTS
//

export interface VoyageCreatedEvent {
  voyageId: string;
  voyageNumber: string;
  departureId: string;
  vesselId: string;
}

export interface VoyageDepartedEvent {
  voyageId: string;
  voyageNumber: string;
  actualDeparture?: string;
}

export interface VoyageArrivedEvent {
  voyageId: string;
  voyageNumber: string;
  actualArrival?: string;
}

export interface VoyageCompletedEvent {
  voyageId: string;
  voyageNumber: string;
  completionSummary?: string;
}

export interface VoyageCancelledEvent {
  voyageId: string;
  voyageNumber: string;
  reason?: string;
}

export interface CaptainAssignedEvent {
  voyageId: string;
  voyageNumber: string;
  captainId: string;
}

export interface CrewAssignedEvent {
  voyageId: string;
  voyageNumber: string;
  crewMemberId: string;
  crewRole: string;
}

export interface CrewRemovedEvent {
  voyageId: string;
  voyageNumber: string;
  crewMemberId: string;
}

export interface ManifestLockedEvent {
  voyageId: string;
  voyageNumber: string;
  passengerCount: number;
}

export interface PassengerCheckedInEvent {
  manifestId: string;
  voyageId: string;
  bookingId: string;
  guestId: string;
}

export interface PassengerBoardedEvent {
  manifestId: string;
  voyageId: string;
  bookingId: string;
  guestId: string;
}

export interface BoardingUndoneEvent {
  manifestId: string;
  voyageId: string;
  bookingId: string;
}

export interface ReadinessVerifiedEvent {
  voyageId: string;
  checkType: string;
  status: boolean;
}

export interface IncidentReportedEvent {
  incidentId: string;
  voyageId: string;
  type: string;
  severity: string;
}

//
// COMMERCIAL DOMAIN EVENTS
//

export interface PricingCalculatedEvent {
  experienceId?: string;
  context: Record<string, unknown>;
  basePrice: number;
  adjustedPrice: number;
  currency: string;
  rulesApplied: Array<Record<string, unknown>>;
}

export interface PromotionValidatedEvent {
  code: string;
  bookingId?: string;
  isValid: boolean;
  reason?: string;
}

export interface PromotionAppliedEvent {
  code: string;
  bookingId?: string;
  discountAmount: number;
  currency: string;
}

export interface PromotionRejectedEvent {
  code: string;
  reason: string;
}

export interface QuoteCreatedEvent {
  quoteId: string;
  quoteReference: string;
  experienceId?: string;
  customerCategory?: string;
  guestCount: number;
  totalAmount: number;
  currency: string;
  validUntil: string;
}

export interface QuoteExpiredEvent {
  quoteId: string;
  quoteReference: string;
}

export interface QuoteConvertedEvent {
  quoteId: string;
  quoteReference: string;
  bookingId: string;
}

export interface QuoteCancelledEvent {
  quoteId: string;
  quoteReference: string;
  reason?: string;
}

export interface ReservationHoldCreatedEvent {
  holdId: string;
  holdReference: string;
  experienceId?: string;
  guestCount: number;
  expiresAt: string;
}

export interface ReservationHoldExpiredEvent {
  holdId: string;
  holdReference: string;
}

export interface ReservationHoldConvertedEvent {
  holdId: string;
  holdReference: string;
  bookingId?: string;
  quoteId?: string;
}

export interface ReservationHoldReleasedEvent {
  holdId: string;
  holdReference: string;
}

export interface PriceListActivatedEvent {
  priceListId: string;
  priceListName: string;
  priority: number;
}

export interface PriceListExpiredEvent {
  priceListId: string;
  priceListName: string;
}

export interface PricingRuleCreatedEvent {
  ruleId: string;
  ruleName: string;
  ruleType: string;
}

export interface PricingRuleUpdatedEvent {
  ruleId: string;
  ruleName: string;
}

export interface PromotionCreatedEvent {
  promotionId: string;
  promotionName: string;
  code: string;
}

export interface PromotionStatusChangedEvent {
  promotionId: string;
  oldStatus: string;
  newStatus: string;
}

export interface CommercialSummaryGeneratedEvent {
  summaryId: string;
  summaryReference: string;
  bookingId?: string;
  totalAmount: number;
  currency: string;
}

export interface CommercialSummaryConfirmedEvent {
  summaryId: string;
  summaryReference: string;
  bookingId?: string;
}

export interface TaxRuleActivatedEvent {
  taxRuleId: string;
  taxName: string;
  type: string;
  jurisdiction: string;
}

export interface TaxCalculatedEvent {
  taxCalculationId: string;
  bookingId?: string;
  taxAmount: number;
  currency: string;
}

export interface CommissionCalculatedEvent {
  commissionCalculationId: string;
  partnerId?: string;
  commissionAmount: number;
  currency: string;
  type: string;
}

export interface CommissionPaidEvent {
  commissionCalculationId: string;
  partnerId?: string;
  commissionAmount: number;
  currency: string;
}

export interface RefundCalculatedEvent {
  refundCalculationId: string;
  bookingId: string;
  refundAmount: number;
  currency: string;
}

export interface RefundApprovedEvent {
  refundCalculationId: string;
  bookingId: string;
  refundAmount: number;
  currency: string;
}

export interface RefundExecutedEvent {
  refundCalculationId: string;
  bookingId: string;
  refundAmount: number;
  currency: string;
}

export interface RefundFailedEvent {
  refundCalculationId: string;
  bookingId: string;
  reason: string;
}

export interface CancellationPolicyAppliedEvent {
  bookingId: string;
  policyId: string;
  refundAmount: number;
  currency: string;
}

export interface AddOnCreatedEvent {
  addOnId: string;
  addOnName: string;
  category: string;
}

export interface DiscountAppliedEvent {
  bookingId?: string;
  quoteId?: string;
  discountAmount: number;
  currency: string;
  appliedBy: string;
}

//
// CRM DOMAIN EVENTS
//

export interface CustomerCreatedEvent {
  customerId: string;
  customerNumber?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  source?: string;
}

export interface CustomerUpdatedEvent {
  customerId: string;
  changedFields: string[];
}

export interface CustomerStatusChangedEvent {
  customerId: string;
  oldStatus: string;
  newStatus: string;
  reason?: string;
}

export interface CustomerContactAddedEvent {
  customerId: string;
  contactId: string;
  type: string;
  value: string;
}

export interface CustomerContactRemovedEvent {
  customerId: string;
  contactId: string;
}

export interface CustomerAddressAddedEvent {
  customerId: string;
  addressId: string;
  type: string;
}

export interface CustomerSegmentAssignedEvent {
  customerId: string;
  segmentId: string;
  segmentCode: string;
}

export interface CustomerSegmentRemovedEvent {
  customerId: string;
  segmentId: string;
}

export interface CustomerTagAddedEvent {
  customerId: string;
  tag: string;
}

export interface CustomerTagRemovedEvent {
  customerId: string;
  tag: string;
}

export interface CustomerPreferenceUpdatedEvent {
  customerId: string;
  category: string;
  key: string;
}

export interface CustomerTimelineEvent {
  timelineId: string;
  customerId: string;
  eventType: string;
  description: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export interface CustomerInteractionCreatedEvent {
  interactionId: string;
  customerId: string;
  type: string;
  direction: string;
}

export interface CustomerConsentUpdatedEvent {
  customerId: string;
  channel: string;
  consentType: string;
  isGranted: boolean;
}

export interface CustomerRelationshipCreatedEvent {
  relationshipId: string;
  customerId: string;
  relatedCustomerId: string;
  type: string;
}

export interface CustomerDocumentUploadedEvent {
  documentId: string;
  customerId: string;
  documentType: string;
  status: string;
}

export interface LoyaltyTierChangedEvent {
  customerId: string;
  oldTierId?: string;
  newTierId: string;
  newTierCode: string;
  newTierLevel: number;
}

export interface LoyaltyPointsUpdatedEvent {
  customerId: string;
  pointsEarned: number;
  pointsRedeemed: number;
  newBalance: number;
}

export interface CustomerMergedEvent {
  sourceCustomerId: string;
  targetCustomerId: string;
}

export interface CustomerIntelligenceUpdatedEvent {
  customerId: string;
  lifetimeValue: number;
  totalBookings: number;
  totalTripsCompleted: number;
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

export interface RefundRequestedEvent {
  refundRequestId: string;
  requestReference: string;
  paymentId: string;
  amount: number;
  currency: string;
  reason: string;
}

export interface RefundApprovedEvent {
  refundRequestId: string;
  refundId: string;
  paymentId: string;
  amount: number;
  currency: string;
}

export interface RefundCompletedEvent {
  refundId: string;
  refundReference: string;
  paymentId: string;
  amount: number;
  currency: string;
  providerRefundId?: string;
}

export interface RefundFailedEvent {
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
