import { EventEmitter } from "events";
import type {
  UserCreatedEvent,
  UserSuspendedEvent,
  UserTerminatedEvent,
  UserActivatedEvent,
  UserVerifiedEvent,
  RoleAssignedEvent,
  RoleRemovedEvent,
  SessionCreatedEvent,
  SessionRevokedEvent,
  SessionRevokedAllEvent,
  OtpSentEvent,
  OtpVerifiedEvent,
  PartnerActivatedEvent,
  PartnerSuspendedEvent,
  PartnerTerminatedEvent,
  PartnerCreatedEvent,
  PayoutAccountAddedEvent,
  PayoutAccountRemovedEvent,
  ExperienceCreatedEvent,
  ExperienceUpdatedEvent,
  ExperienceActivatedEvent,
  ExperienceDeactivatedEvent,
  RouteCreatedEvent,
  RouteUpdatedEvent,
  RouteArchivedEvent,
  StopAssignedEvent,
  StopReorderedEvent,
  VesselActivatedEvent,
  VesselDeactivatedEvent,
  VesselDecommissionedEvent,
  VesselCreatedEvent,
  VesselUpdatedEvent,
  VesselMaintenanceScheduledEvent,
  VesselMaintenanceCompletedEvent,
  DepartureCreatedEvent,
  DeparturePublishedEvent,
  DepartureCancelledEvent,
  DepartureRescheduledEvent,
  DepartureClosedEvent,
  DepartureAssignedEvent,
  DepartureUpdatedEvent,
  GuestCreatedEvent,
  GuestUpdatedEvent,
  GuestMergedEvent,
  BookingCreatedEvent,
  BookingCancelledEvent,
  BookingCompletedEvent,
  BookingStatusChangedEvent,
  BookingConfirmedEvent,
  RewardCreatedEvent,
  RewardPaidEvent,
  RewardReversedEvent,
  RewardRuleCreatedEvent,
  RewardRuleUpdatedEvent,
  VoyageCreatedEvent,
  VoyageDepartedEvent,
  VoyageArrivedEvent,
  VoyageCompletedEvent,
  VoyageCancelledEvent,
  CaptainAssignedEvent,
  CrewAssignedEvent,
  CrewRemovedEvent,
  ManifestLockedEvent,
  PassengerCheckedInEvent,
  PassengerBoardedEvent,
  BoardingUndoneEvent,
  ReadinessVerifiedEvent,
  IncidentReportedEvent,
  PricingCalculatedEvent,
  PromotionValidatedEvent,
  PromotionAppliedEvent,
  PromotionRejectedEvent,
  QuoteCreatedEvent,
  QuoteExpiredEvent,
  QuoteConvertedEvent,
  QuoteCancelledEvent,
  ReservationHoldCreatedEvent,
  ReservationHoldExpiredEvent,
  ReservationHoldConvertedEvent,
  ReservationHoldReleasedEvent,
  PriceListActivatedEvent,
  PriceListExpiredEvent,
  PricingRuleCreatedEvent,
  PricingRuleUpdatedEvent,
  PromotionCreatedEvent,
  PromotionStatusChangedEvent,
  CommercialSummaryGeneratedEvent,
  CommercialSummaryConfirmedEvent,
  TaxRuleActivatedEvent,
  TaxCalculatedEvent,
  CommissionCalculatedEvent,
  CommissionPaidEvent,
  RefundCalculatedEvent,
  CancellationPolicyAppliedEvent,
  AddOnCreatedEvent,
  DiscountAppliedEvent,
  CustomerCreatedEvent,
  CustomerUpdatedEvent,
  CustomerStatusChangedEvent,
  CustomerContactAddedEvent,
  CustomerContactRemovedEvent,
  CustomerAddressAddedEvent,
  CustomerSegmentAssignedEvent,
  CustomerSegmentRemovedEvent,
  CustomerTagAddedEvent,
  CustomerTagRemovedEvent,
  CustomerPreferenceUpdatedEvent,
  CustomerTimelineEvent,
  CustomerInteractionCreatedEvent,
  CustomerConsentUpdatedEvent,
  CustomerRelationshipCreatedEvent,
  CustomerDocumentUploadedEvent,
  LoyaltyTierChangedEvent,
  LoyaltyPointsUpdatedEvent,
  CustomerMergedEvent,
  CustomerIntelligenceUpdatedEvent,
  PaymentIntentCreatedEvent,
  PaymentAuthorizedEvent,
  PaymentCapturedEvent,
  PaymentFailedEvent,
  PaymentCancelledEvent,
  PaymentExpiredEvent,
  LedgerEntryPostedEvent,
  WalletCreditedEvent,
  WalletDebitedEvent,
  InvoiceIssuedEvent,
  InvoiceCancelledEvent,
  FinanceRefundRequestedEvent,
  FinanceRefundApprovedEvent,
  FinanceRefundCompletedEvent,
  FinanceRefundFailedEvent,
  SettlementCreatedEvent,
  SettlementApprovedEvent,
  SettlementCompletedEvent,
  SettlementFailedEvent,
  JournalEntryCreatedEvent,
  JournalEntryPostedEvent,
  RevenueRecognizedEvent,
  RevenueDeferredEvent,
  TaxPostedEvent,
  CommissionSettledEvent,
  ReconciliationStartedEvent,
  ReconciliationCompletedEvent,
  PayoutCreatedEvent,
  PayoutProcessedEvent,
  PayoutCompletedEvent,
  PayoutFailedEvent,
} from "./domain-events";

export type EventHandler<T = unknown> = (event: T) => void | Promise<void>;

type EventMap = {
  "user.created": UserCreatedEvent;
  "user.suspended": UserSuspendedEvent;
  "user.terminated": UserTerminatedEvent;
  "user.activated": UserActivatedEvent;
  "user.verified": UserVerifiedEvent;
  "role.assigned": RoleAssignedEvent;
  "role.removed": RoleRemovedEvent;
  "session.created": SessionCreatedEvent;
  "session.revoked": SessionRevokedEvent;
  "session.revoked.all": SessionRevokedAllEvent;
  "otp.sent": OtpSentEvent;
  "otp.verified": OtpVerifiedEvent;
  "partner.activated": PartnerActivatedEvent;
  "partner.suspended": PartnerSuspendedEvent;
  "partner.terminated": PartnerTerminatedEvent;
  "partner.created": PartnerCreatedEvent;
  "payout.account.added": PayoutAccountAddedEvent;
  "payout.account.removed": PayoutAccountRemovedEvent;
  "experience.created": ExperienceCreatedEvent;
  "experience.updated": ExperienceUpdatedEvent;
  "experience.activated": ExperienceActivatedEvent;
  "experience.deactivated": ExperienceDeactivatedEvent;
  "route.created": RouteCreatedEvent;
  "route.updated": RouteUpdatedEvent;
  "route.archived": RouteArchivedEvent;
  "stop.assigned": StopAssignedEvent;
  "stop.reordered": StopReorderedEvent;
  "vessel.activated": VesselActivatedEvent;
  "vessel.deactivated": VesselDeactivatedEvent;
  "vessel.decommissioned": VesselDecommissionedEvent;
  "vessel.created": VesselCreatedEvent;
  "vessel.updated": VesselUpdatedEvent;
  "vessel.maintenance.scheduled": VesselMaintenanceScheduledEvent;
  "vessel.maintenance.completed": VesselMaintenanceCompletedEvent;
  "departure.created": DepartureCreatedEvent;
  "departure.published": DeparturePublishedEvent;
  "departure.cancelled": DepartureCancelledEvent;
  "departure.rescheduled": DepartureRescheduledEvent;
  "departure.closed": DepartureClosedEvent;
  "departure.assigned": DepartureAssignedEvent;
  "departure.updated": DepartureUpdatedEvent;
  "guest.created": GuestCreatedEvent;
  "guest.updated": GuestUpdatedEvent;
  "guest.merged": GuestMergedEvent;
  "booking.created": BookingCreatedEvent;
  "booking.cancelled": BookingCancelledEvent;
  "booking.completed": BookingCompletedEvent;
  "booking.status.changed": BookingStatusChangedEvent;
  "booking.confirmed": BookingConfirmedEvent;
  "reward.created": RewardCreatedEvent;
  "reward.paid": RewardPaidEvent;
  "reward.reversed": RewardReversedEvent;
  "reward.rule.created": RewardRuleCreatedEvent;
  "reward.rule.updated": RewardRuleUpdatedEvent;
  "voyage.created": VoyageCreatedEvent;
  "voyage.departed": VoyageDepartedEvent;
  "voyage.arrived": VoyageArrivedEvent;
  "voyage.completed": VoyageCompletedEvent;
  "voyage.cancelled": VoyageCancelledEvent;
  "voyage.captain.assigned": CaptainAssignedEvent;
  "voyage.crew.assigned": CrewAssignedEvent;
  "voyage.crew.removed": CrewRemovedEvent;
  "voyage.manifest.locked": ManifestLockedEvent;
  "voyage.passenger.checkedIn": PassengerCheckedInEvent;
  "voyage.passenger.boarded": PassengerBoardedEvent;
  "voyage.boarding.undone": BoardingUndoneEvent;
  "voyage.readiness.verified": ReadinessVerifiedEvent;
  "voyage.incident.reported": IncidentReportedEvent;
  "pricing.calculated": PricingCalculatedEvent;
  "promotion.validated": PromotionValidatedEvent;
  "promotion.applied": PromotionAppliedEvent;
  "promotion.rejected": PromotionRejectedEvent;
  "quote.created": QuoteCreatedEvent;
  "quote.expired": QuoteExpiredEvent;
  "quote.converted": QuoteConvertedEvent;
  "quote.cancelled": QuoteCancelledEvent;
  "reservation.hold.created": ReservationHoldCreatedEvent;
  "reservation.hold.expired": ReservationHoldExpiredEvent;
  "reservation.hold.converted": ReservationHoldConvertedEvent;
  "reservation.hold.released": ReservationHoldReleasedEvent;
  "price.list.activated": PriceListActivatedEvent;
  "price.list.expired": PriceListExpiredEvent;
  "pricing.rule.created": PricingRuleCreatedEvent;
  "pricing.rule.updated": PricingRuleUpdatedEvent;
  "promotion.created": PromotionCreatedEvent;
  "promotion.status.changed": PromotionStatusChangedEvent;
  "commercial.summary.generated": CommercialSummaryGeneratedEvent;
  "commercial.summary.confirmed": CommercialSummaryConfirmedEvent;
  "tax.rule.activated": TaxRuleActivatedEvent;
  "tax.calculated": TaxCalculatedEvent;
  "commission.calculated": CommissionCalculatedEvent;
  "commission.paid": CommissionPaidEvent;
  "refund.calculated": RefundCalculatedEvent;
  "cancellation.policy.applied": CancellationPolicyAppliedEvent;
  "addon.created": AddOnCreatedEvent;
  "discount.applied": DiscountAppliedEvent;
  "customer.created": CustomerCreatedEvent;
  "customer.updated": CustomerUpdatedEvent;
  "customer.status.changed": CustomerStatusChangedEvent;
  "customer.contact.added": CustomerContactAddedEvent;
  "customer.contact.removed": CustomerContactRemovedEvent;
  "customer.address.added": CustomerAddressAddedEvent;
  "customer.segment.assigned": CustomerSegmentAssignedEvent;
  "customer.segment.removed": CustomerSegmentRemovedEvent;
  "customer.tag.added": CustomerTagAddedEvent;
  "customer.tag.removed": CustomerTagRemovedEvent;
  "customer.preference.updated": CustomerPreferenceUpdatedEvent;
  "customer.timeline.created": CustomerTimelineEvent;
  "customer.interaction.created": CustomerInteractionCreatedEvent;
  "customer.consent.updated": CustomerConsentUpdatedEvent;
  "customer.relationship.created": CustomerRelationshipCreatedEvent;
  "customer.document.uploaded": CustomerDocumentUploadedEvent;
  "customer.tier.changed": LoyaltyTierChangedEvent;
  "loyalty.points.updated": LoyaltyPointsUpdatedEvent;
  "customer.merged": CustomerMergedEvent;
  "customer.intelligence.updated": CustomerIntelligenceUpdatedEvent;
  "payment.intent.created": PaymentIntentCreatedEvent;
  "payment.authorized": PaymentAuthorizedEvent;
  "payment.captured": PaymentCapturedEvent;
  "payment.failed": PaymentFailedEvent;
  "payment.cancelled": PaymentCancelledEvent;
  "payment.expired": PaymentExpiredEvent;
  "ledger.entry.posted": LedgerEntryPostedEvent;
  "wallet.credited": WalletCreditedEvent;
  "wallet.debited": WalletDebitedEvent;
  "invoice.issued": InvoiceIssuedEvent;
  "invoice.cancelled": InvoiceCancelledEvent;
  "finance.refund.requested": FinanceRefundRequestedEvent;
  "finance.refund.approved": FinanceRefundApprovedEvent;
  "finance.refund.completed": FinanceRefundCompletedEvent;
  "finance.refund.failed": FinanceRefundFailedEvent;
  "settlement.created": SettlementCreatedEvent;
  "settlement.approved": SettlementApprovedEvent;
  "settlement.completed": SettlementCompletedEvent;
  "settlement.failed": SettlementFailedEvent;
  "journal.entry.created": JournalEntryCreatedEvent;
  "journal.entry.posted": JournalEntryPostedEvent;
  "revenue.recognized": RevenueRecognizedEvent;
  "revenue.deferred": RevenueDeferredEvent;
  "tax.posted": TaxPostedEvent;
  "commission.settled": CommissionSettledEvent;
  "reconciliation.started": ReconciliationStartedEvent;
  "reconciliation.completed": ReconciliationCompletedEvent;
  "payout.created": PayoutCreatedEvent;
  "payout.processed": PayoutProcessedEvent;
  "payout.completed": PayoutCompletedEvent;
  "payout.failed": PayoutFailedEvent;
};

class EventBusImpl {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100);
  }

  on<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): () => void {
    this.emitter.on(event, handler);
    return () => this.off(event, handler);
  }

  off<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void {
    this.emitter.off(event, handler as EventHandler);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    this.emitter.emit(event, payload);
  }
}

export const eventBus = new EventBusImpl();
