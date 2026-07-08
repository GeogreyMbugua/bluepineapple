/**
 * @blue-pineapple/iam — public package surface.
 *
 * Consumer code should only import from this entry point.
 */
// ── Constants ────────────────────────────────────────────────────────────
export { PERMISSIONS } from "./constants/permission.constants";
export { ROLES, ROLE_PERMISSIONS } from "./constants/auth.constants";
// ── Errors ───────────────────────────────────────────────────────────────
export { UnauthorizedError, ForbiddenError, isUnauthorizedError, isForbiddenError } from "./authorization/errors";
// ── RBAC (pure functions) ────────────────────────────────────────────────
export { hasRole, hasAnyRole, hasAllRoles, isSuperAdmin, hasPermission, hasAnyPermission, hasAllPermissions, authorize, assertAuthorized, } from "./authorization";
// ── Middleware ───────────────────────────────────────────────────────────
export { authenticateRequest, authorizeRequest, guardRequest, requireRole, requireAnyRole, } from "./middleware";
// ── Policy Engine (ABAC) ─────────────────────────────────────────────────
export { PolicyEngine } from "./authorization/policy-engine";
// ── Identity Provider Facade ─────────────────────────────────────────────
export { IdentityProvider, identityProvider, } from "./provider";
// ── Login / Auth Flow ──────────────────────────────────────────────────
export { LoginService, loginService, } from "./auth/login.service";
export { AuthController, authController, } from "./controllers";
// ── Validation Schemas ───────────────────────────────────────────────────
export { RequestOtpSchema, VerifyOtpSchema, RefreshTokenSchema, } from "./validators";
// ── Notifications (adapter) ──────────────────────────────────────────────
export { ConsoleNotificationAdapter, notificationService, } from "./adapters";
// ── Audit ─────────────────────────────────────────────────────────────────
export { AuditService, auditService, AuditLogger, auditLogger, } from "./audit";
// ── User Domain ─────────────────────────────────────────────────────────
export { UserService, userService, UserLifecycleService, userLifecycleService, CurrentUserService, currentUserService, } from "./users";
export { CreateUserSchema, UpdateProfileSchema, } from "./users/user.validators";
// ── Partner Domain ──────────────────────────────────────────────────────
export { PartnerService, partnerService, PartnerLifecycleService, partnerLifecycleService, } from "./partners";
export { CreatePartnerSchema, UpdatePartnerSchema, AddPayoutAccountSchema, } from "./partners/partner.validators";
// ── Domain Events ────────────────────────────────────────────────────────
export { eventBus, } from "./events";
// ── Experience Domain ────────────────────────────────────────────────────
export { ExperienceService, experienceService, } from "./experiences";
export { CreateExperienceSchema, UpdateExperienceSchema, ExperienceSearchSchema, } from "./experiences/experience.validators";
// ── Route Domain ─────────────────────────────────────────────────────────
export { RouteService, routeService, } from "./routes";
export { CreateRouteSchema, UpdateRouteSchema, AssignStopSchema, ReorderStopSchema, RouteSearchSchema, } from "./routes/route.validators";
// ── Fleet Domain ─────────────────────────────────────────────────────────
export { VesselService, vesselService, MaintenanceService, maintenanceService, } from "./fleet";
export { CreateVesselSchema, UpdateVesselSchema, MaintenanceLogSchema, UpdateMaintenanceLogSchema, FleetAvailabilitySchema, } from "./fleet/fleet.validators";
// ── Departure Domain ─────────────────────────────────────────────────────
export { DepartureService, departureService, } from "./departures";
export { CreateDepartureSchema, UpdateDepartureSchema, DepartureSearchSchema, AssignVesselSchema, AssignRouteSchema, AssignExperienceSchema, } from "./departures/departure.validators";
// ── Booking Domain ───────────────────────────────────────────────────────
export { BookingService, bookingService, GuestService, guestService, BookingPolicy, BookingCapacityService, bookingCapacityService, } from "./bookings";
export { CreateBookingSchema, UpdateBookingSchema, BookingSearchSchema, CancelBookingSchema, } from "./bookings/booking.validators";
export { CreateGuestSchema, UpdateGuestSchema, GuestSearchSchema, } from "./bookings/guest.validators";
// ── Reward Domain ────────────────────────────────────────────────────────
export { RewardService, rewardService, RewardEngine, rewardEngine, } from "./rewards";
export { CreateRewardRuleSchema, UpdateRewardRuleSchema, RewardSearchSchema, } from "./rewards/reward.validators";
// ── Operations Domain ────────────────────────────────────────────────────────
export { VoyageService, voyageService, CrewService, crewService, ManifestService, manifestService, ReadinessService, readinessService, IncidentService, incidentService, } from "./operations";
export { CreateVoyageSchema, UpdateVoyageSchema, VoyageSearchSchema, AssignCaptainSchema, AssignCrewSchema, RemoveCrewSchema, GenerateManifestSchema, CancelVoyageSchema, CreateCrewMemberSchema, UpdateCrewMemberSchema, ReadinessCheckSchema, CreateIncidentSchema, UpdateIncidentSchema, CheckInSchema, BoardingSchema, UndoBoardingSchema, CompleteVoyageSchema, } from "./operations/operations.validators";
