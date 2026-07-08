import { z } from "zod";
export const CreateVoyageSchema = z.object({
    departureId: z.string().uuid("Valid departure ID is required"),
    vesselId: z.string().uuid("Valid vessel ID is required"),
    routeId: z.string().uuid("Valid route ID is required"),
    captainId: z.string().uuid("Valid captain ID is required").optional().nullable(),
    operationalNotes: z.string().max(2000).optional().nullable(),
});
export const UpdateVoyageSchema = z.object({
    captainId: z.string().uuid().optional().nullable(),
    operationalNotes: z.string().max(2000).optional().nullable(),
    weatherSummary: z.string().max(1000).optional().nullable(),
    actualDeparture: z.coerce.date().optional().nullable(),
    actualArrival: z.coerce.date().optional().nullable(),
});
export const VoyageSearchSchema = z.object({
    status: z
        .enum(["PLANNED", "READY", "BOARDING", "DEPARTED", "ARRIVED", "COMPLETED", "CANCELLED", "ABORTED"])
        .optional(),
    vesselId: z.string().uuid().optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    limit: z.number().int().positive().max(100).default(20),
});
export const AssignCaptainSchema = z.object({
    captainId: z.string().uuid("Valid captain ID is required"),
});
export const AssignCrewSchema = z.object({
    crewMemberId: z.string().uuid("Valid crew member ID is required"),
    crewRole: z.enum(["CAPTAIN", "DECKHAND", "GUIDE", "ENGINEER", "OPERATIONS_MANAGER"]),
});
export const RemoveCrewSchema = z.object({
    crewMemberId: z.string().uuid("Valid crew member ID is required"),
});
export const GenerateManifestSchema = z.object({
    voyageId: z.string().uuid("Valid voyage ID is required"),
});
export const CancelVoyageSchema = z.object({
    reason: z.string().max(500).optional().nullable(),
});
export const CreateCrewMemberSchema = z.object({
    userId: z.string().uuid().optional().nullable(),
    firstName: z.string().min(1, "First name is required").max(100),
    lastName: z.string().min(1, "Last name is required").max(100),
    crewRole: z.enum(["CAPTAIN", "DECKHAND", "GUIDE", "ENGINEER", "OPERATIONS_MANAGER"]),
    licenseNumber: z.string().max(100).optional().nullable(),
    certification: z.string().max(500).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
});
export const UpdateCrewMemberSchema = z.object({
    userId: z.string().uuid().optional().nullable(),
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    crewRole: z.enum(["CAPTAIN", "DECKHAND", "GUIDE", "ENGINEER", "OPERATIONS_MANAGER"]).optional(),
    licenseNumber: z.string().max(100).optional().nullable(),
    certification: z.string().max(500).optional().nullable(),
    isActive: z.boolean().optional(),
    notes: z.string().max(1000).optional().nullable(),
});
export const ReadinessCheckSchema = z.object({
    checkType: z.enum(["CREW_ASSIGNED", "MAINTENANCE_COMPLETE", "INSPECTION_COMPLETE", "FUEL_CONFIRMED", "SAFETY_EQUIPMENT_CONFIRMED", "WEATHER_ACCEPTABLE"]),
    status: z.boolean(),
    notes: z.string().max(500).optional().nullable(),
});
export const CreateIncidentSchema = z.object({
    voyageId: z.string().uuid("Valid voyage ID is required"),
    type: z.enum(["MEDICAL", "MECHANICAL", "WEATHER", "PASSENGER", "SAFETY", "NAVIGATION"]),
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    description: z.string().min(1, "Description is required").max(2000),
    metadata: z.any().optional().nullable(),
});
export const UpdateIncidentSchema = z.object({
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    description: z.string().min(1).max(2000).optional(),
    resolution: z.string().max(2000).optional().nullable(),
});
export const CheckInSchema = z.object({
    manifestId: z.string().uuid("Valid manifest ID is required"),
    boardingGroup: z.string().max(50).optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
});
export const BoardingSchema = z.object({
    manifestId: z.string().uuid("Valid manifest ID is required"),
    status: z.enum(["BOARDED", "LATE", "DENIED"]).default("BOARDED"),
    notes: z.string().max(500).optional().nullable(),
});
export const UndoBoardingSchema = z.object({
    notes: z.string().max(500).optional().nullable(),
});
export const CompleteVoyageSchema = z.object({
    actualDeparture: z.coerce.date().optional().nullable(),
    actualArrival: z.coerce.date().optional().nullable(),
    completionSummary: z.string().max(2000).optional().nullable(),
});
