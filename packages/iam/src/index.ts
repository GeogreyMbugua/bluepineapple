/**
 * @blue-pineapple/iam — public package surface.
 *
 * Consumer code should only import from this entry point.
 */

// ── Types ────────────────────────────────────────────────────────────────

export type { AuthUser } from "./types/auth-user";
export type { JwtClaims } from "./types/claims";
export type { Permission } from "./types/permissions";
export type { Role } from "./types/roles";
export type { Session, SessionUser } from "./types/session";

// ── Constants ────────────────────────────────────────────────────────────

export { PERMISSIONS } from "./constants/permission.constants";
export { ROLES, ROLE_PERMISSIONS } from "./constants/auth.constants";

// ── Errors ───────────────────────────────────────────────────────────────

export { UnauthorizedError, ForbiddenError, isUnauthorizedError, isForbiddenError } from "./authorization/errors";

// ── RBAC (pure functions) ────────────────────────────────────────────────

export {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  isSuperAdmin,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  authorize,
  assertAuthorized,
  type AuthorizeOptions,
  type AuthGuard,
} from "./authorization";

// ── Middleware ───────────────────────────────────────────────────────────

export {
  authenticateRequest,
  authorizeRequest,
  guardRequest,
  requireRole,
  requireAnyRole,
} from "./middleware";

// ── Policy Engine (ABAC) ─────────────────────────────────────────────────

export { PolicyEngine, type Policy } from "./authorization/policy-engine";

// ── Identity Provider Facade ─────────────────────────────────────────────

export {
  IdentityProvider,
  identityProvider,
} from "./provider";

export type {
  IdentityProviderOptions,
  AuthResult,
  RefreshResult,
  LogoutResult,
} from "./provider";

// ── Login / Auth Flow ──────────────────────────────────────────────────

export {
  LoginService,
  loginService,
} from "./auth/login.service";

export {
  AuthController,
  authController,
} from "./controllers";

// ── Validation Schemas ───────────────────────────────────────────────────

export {
  RequestOtpSchema,
  VerifyOtpSchema,
  RefreshTokenSchema,
} from "./validators";

export type {
  RequestOtpInput,
  VerifyOtpInput,
  RefreshTokenInput,
} from "./validators";

// ── Notifications (adapter) ──────────────────────────────────────────────

export {
  ConsoleNotificationAdapter,
  notificationService,
} from "./adapters";

export type {
  NotificationAdapter,
  NotificationMessage,
} from "./adapters";

// ── Audit ─────────────────────────────────────────────────────────────────

export {
  AuditService,
  auditService,
  AuditLogger,
  auditLogger,
} from "./audit";

// ── User Domain ─────────────────────────────────────────────────────────

export {
  UserService,
  userService,
  UserLifecycleService,
  userLifecycleService,
  CurrentUserService,
  currentUserService,
} from "./users";

export {
  CreateUserSchema,
  UpdateProfileSchema,
} from "./users/user.validators";

export type {
  CreateUserInput,
  UpdateProfileInput,
} from "./users/user.validators";

// ── Partner Domain ──────────────────────────────────────────────────────

export {
  PartnerService,
  partnerService,
  PartnerLifecycleService,
  partnerLifecycleService,
} from "./partners";

export {
  CreatePartnerSchema,
  UpdatePartnerSchema,
  AddPayoutAccountSchema,
} from "./partners/partner.validators";

export type {
  CreatePartnerInput,
  UpdatePartnerInput,
  AddPayoutAccountInput,
} from "./partners/partner.validators";

export type {
  PartnerProfileData,
  PartnerWithPayoutAccounts,
  PartnerPayoutAccountData,
  PartnerSummary,
} from "./partners/partner.types";

// ── Domain Events ────────────────────────────────────────────────────────

export {
  eventBus,
  type UserCreatedEvent,
  type UserSuspendedEvent,
  type UserTerminatedEvent,
  type UserActivatedEvent,
  type UserVerifiedEvent,
  type RoleAssignedEvent,
  type RoleRemovedEvent,
  type SessionCreatedEvent,
  type SessionRevokedEvent,
  type SessionRevokedAllEvent,
  type OtpSentEvent,
  type OtpVerifiedEvent,
  type PartnerActivatedEvent,
  type PartnerSuspendedEvent,
  type PartnerTerminatedEvent,
  type PartnerCreatedEvent,
  type PayoutAccountAddedEvent,
  type PayoutAccountRemovedEvent,
  type ExperienceCreatedEvent,
  type ExperienceUpdatedEvent,
  type ExperienceActivatedEvent,
  type ExperienceDeactivatedEvent,
  type RouteCreatedEvent,
  type RouteUpdatedEvent,
  type RouteArchivedEvent,
  type StopAssignedEvent,
  type StopReorderedEvent,
  type VesselActivatedEvent,
  type VesselDeactivatedEvent,
  type VesselDecommissionedEvent,
  type VesselCreatedEvent,
  type VesselUpdatedEvent,
  type VesselMaintenanceScheduledEvent,
  type VesselMaintenanceCompletedEvent,
  type DepartureCreatedEvent,
  type DeparturePublishedEvent,
  type DepartureCancelledEvent,
  type DepartureRescheduledEvent,
  type DepartureClosedEvent,
  type DepartureAssignedEvent,
  type DepartureUpdatedEvent,
  type GuestCreatedEvent,
  type GuestUpdatedEvent,
  type GuestMergedEvent,
  type BookingCreatedEvent,
  type BookingCancelledEvent,
  type BookingCompletedEvent,
  type BookingStatusChangedEvent,
  type BookingConfirmedEvent,
  type RewardCreatedEvent,
  type RewardPaidEvent,
  type RewardReversedEvent,
  type RewardRuleCreatedEvent,
  type RewardRuleUpdatedEvent,
} from "./events";

// ── Experience Domain ────────────────────────────────────────────────────

export {
  ExperienceService,
  experienceService,
} from "./experiences";

export {
  CreateExperienceSchema,
  UpdateExperienceSchema,
  ExperienceSearchSchema,
} from "./experiences/experience.validators";

export type {
  CreateExperienceInput,
  UpdateExperienceInput,
  ExperienceSearchInput,
} from "./experiences/experience.validators";

export type {
  ExperienceData,
  ExperienceWithRoutes,
  ExperienceRouteData,
} from "./experiences/experience.types";

// ── Route Domain ─────────────────────────────────────────────────────────

export {
  RouteService,
  routeService,
} from "./routes";

export {
  CreateRouteSchema,
  UpdateRouteSchema,
  AssignStopSchema,
  ReorderStopSchema,
  RouteSearchSchema,
} from "./routes/route.validators";

export type {
  CreateRouteInput,
  UpdateRouteInput,
  AssignStopInput,
  ReorderStopInput,
  RouteSearchInput,
} from "./routes/route.validators";

export type {
  RouteData,
  RouteStopData,
  RouteWithStops,
  RouteWithDetails,
  RouteListInput,
} from "./routes/route.types";

// ── Fleet Domain ─────────────────────────────────────────────────────────

export {
  VesselService,
  vesselService,
  MaintenanceService,
  maintenanceService,
} from "./fleet";

export {
  CreateVesselSchema,
  UpdateVesselSchema,
  MaintenanceLogSchema,
  UpdateMaintenanceLogSchema,
  FleetAvailabilitySchema,
} from "./fleet/fleet.validators";

export type {
  CreateVesselInput,
  UpdateVesselInput,
  MaintenanceLogInput,
  UpdateMaintenanceLogInput,
  FleetAvailabilityInput,
} from "./fleet/fleet.validators";

export type {
  VesselData,
  VesselWithHistory,
  MaintenanceLogData,
} from "./fleet/vessel.types";

// ── Departure Domain ─────────────────────────────────────────────────────

export {
  DepartureService,
  departureService,
} from "./departures";

export {
  CreateDepartureSchema,
  UpdateDepartureSchema,
  DepartureSearchSchema,
  AssignVesselSchema,
  AssignRouteSchema,
  AssignExperienceSchema,
} from "./departures/departure.validators";

export type {
  CreateDepartureInput,
  UpdateDepartureInput,
  DepartureSearchInput,
  AssignVesselInput,
  AssignRouteInput,
  AssignExperienceInput,
} from "./departures/departure.validators";

export type {
  DepartureData,
  DepartureWithDetails,
  CapacityInfo,
} from "./departures/departure.types";

// ── Booking Domain ───────────────────────────────────────────────────────

export {
  BookingService,
  bookingService,
  GuestService,
  guestService,
  BookingPolicy,
  BookingCapacityService,
  bookingCapacityService,
} from "./bookings";

export {
  CreateBookingSchema,
  UpdateBookingSchema,
  BookingSearchSchema,
  CancelBookingSchema,
} from "./bookings/booking.validators";

export type {
  CreateBookingInput,
  UpdateBookingInput,
  BookingSearchInput,
  CancelBookingInput,
} from "./bookings/booking.validators";

export {
  CreateGuestSchema,
  UpdateGuestSchema,
  GuestSearchSchema,
} from "./bookings/guest.validators";

export type {
  CreateGuestInput,
  UpdateGuestInput,
  GuestSearchInput,
} from "./bookings/guest.validators";

export type {
  BookingData,
  BookingWithDetails,
  BookingStatusTransition,
} from "./bookings/booking.types";

export type {
  GuestData,
  GuestWithHistory,
  GuestResolveInput,
} from "./bookings/guest.types";

// ── Reward Domain ────────────────────────────────────────────────────────

export {
  RewardService,
  rewardService,
  RewardEngine,
  rewardEngine,
} from "./rewards";

export {
  CreateRewardRuleSchema,
  UpdateRewardRuleSchema,
  RewardSearchSchema,
} from "./rewards/reward.validators";

export type {
  CreateRewardRuleInput,
  UpdateRewardRuleInput,
  RewardSearchInput,
} from "./rewards/reward.validators";

export type {
  RewardTransactionData,
  RewardRuleData,
  RewardCalculationInput,
  RewardCalculationResult,
} from "./rewards/reward.types";

// ── Operations Domain ────────────────────────────────────────────────────────

export {
  VoyageService,
  voyageService,
  CrewService,
  crewService,
  ManifestService,
  manifestService,
  ReadinessService,
  readinessService,
  IncidentService,
  incidentService,
} from "./operations";

export {
  CreateVoyageSchema,
  UpdateVoyageSchema,
  VoyageSearchSchema,
  AssignCaptainSchema,
  AssignCrewSchema,
  RemoveCrewSchema,
  GenerateManifestSchema,
  CancelVoyageSchema,
  CreateCrewMemberSchema,
  UpdateCrewMemberSchema,
  ReadinessCheckSchema,
  CreateIncidentSchema,
  UpdateIncidentSchema,
  CheckInSchema,
  BoardingSchema,
  UndoBoardingSchema,
  CompleteVoyageSchema,
} from "./operations/operations.validators";

export type {
  CreateVoyageInput,
  UpdateVoyageInput,
  VoyageSearchInput,
  AssignCaptainInput,
  AssignCrewInput,
  RemoveCrewInput,
  GenerateManifestInput,
  CancelVoyageInput,
  CreateCrewMemberInput,
  UpdateCrewMemberInput,
  ReadinessCheckInput,
  CreateIncidentInput,
  UpdateIncidentInput,
  CheckInInput,
  BoardingInput,
  UndoBoardingInput,
  CompleteVoyageInput,
} from "./operations/operations.validators";

export type {
  VoyageData,
  VoyageWithDetails,
  CrewMemberData,
  CrewAssignmentWithMember,
  ManifestData,
  ManifestWithDetails,
  VoyageTimelineEvent,
  IncidentData,
  ReadinessCheckData,
  VoyageCompletionData,
  ManifestCounts,
} from "./operations/operations.types";

export type {
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
} from "./operations/operations.events";

// ── Commercial Domain ─────────────────────────────────────────────────────

export type {
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
  RefundApprovedEvent,
  RefundExecutedEvent,
  RefundFailedEvent,
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
} from "./events/domain-events";
