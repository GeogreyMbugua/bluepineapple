import { z } from 'zod';

export const VoyageStatusSchema = z.enum([
  'PLANNED',
  'READY',
  'BOARDING',
  'DEPARTED',
  'ARRIVED',
  'COMPLETED',
  'CANCELLED',
  'ABORTED',
]);

export const ManifestStatusSchema = z.enum([
  'RESERVED',
  'CHECKED_IN',
  'BOARDED',
  'ON_VOYAGE',
  'COMPLETED',
  'NO_SHOW',
  'CANCELLED',
]);

export const CrewRoleSchema = z.enum([
  'CAPTAIN',
  'DECKHAND',
  'GUIDE',
  'ENGINEER',
  'OPERATIONS_MANAGER',
]);

export const IncidentTypeSchema = z.enum([
  'MEDICAL',
  'MECHANICAL',
  'WEATHER',
  'PASSENGER',
  'SAFETY',
  'NAVIGATION',
]);

export const IncidentSeveritySchema = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
]);

export const VoyageSearchSchema = z.object({
  status: VoyageStatusSchema.optional(),
  vesselId: z.string().uuid().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.number().int().positive().max(100).default(20),
  experienceSlug: z.string().optional(),
});

export const CreateVoyageSchema = z.object({
  departureId: z.string().uuid('Valid departure ID is required'),
  vesselId: z.string().uuid('Valid vessel ID is required'),
  routeId: z.string().uuid('Valid route ID is required'),
  captainId: z.string().uuid('Valid captain ID is required').optional().nullable(),
  operationalNotes: z.string().max(2000).optional().nullable(),
});

export const UpdateVoyageSchema = z.object({
  captainId: z.string().uuid().optional().nullable(),
  operationalNotes: z.string().max(2000).optional().nullable(),
  weatherSummary: z.string().max(1000).optional().nullable(),
  actualDeparture: z.coerce.date().optional().nullable(),
  actualArrival: z.coerce.date().optional().nullable(),
});

export const StatusTransitionSchema = z.object({
  status: VoyageStatusSchema,
  reason: z.string().max(500).optional(),
});

export const AssignCrewSchema = z.object({
  crewMemberId: z.string().uuid('Valid crew member ID is required'),
  crewRole: CrewRoleSchema,
});

export const RemoveCrewSchema = z.object({
  crewMemberId: z.string().uuid('Valid crew member ID is required'),
});

export const GenerateManifestSchema = z.object({
  voyageId: z.string().uuid('Valid voyage ID is required'),
});

export const CheckInSchema = z.object({
  manifestId: z.string().uuid('Valid manifest ID is required'),
  boardingGroup: z.string().max(50).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const BoardingSchema = z.object({
  manifestId: z.string().uuid('Valid manifest ID is required'),
  status: z.enum(['BOARDED', 'LATE', 'DENIED']).default('BOARDED'),
  notes: z.string().max(500).optional().nullable(),
});

export const UndoBoardingSchema = z.object({
  notes: z.string().max(500).optional().nullable(),
});

export const CreateIncidentSchema = z.object({
  voyageId: z.string().uuid('Valid voyage ID is required'),
  type: IncidentTypeSchema,
  severity: IncidentSeveritySchema.optional(),
  description: z.string().min(1, 'Description is required').max(2000),
  metadata: z.any().optional().nullable(),
});

export const CreateCrewMemberSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  crewRole: CrewRoleSchema,
  licenseNumber: z.string().max(100).optional().nullable(),
  certification: z.string().max(500).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const UpdateCrewMemberSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  crewRole: CrewRoleSchema.optional(),
  licenseNumber: z.string().max(100).optional().nullable(),
  certification: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export type VoyageStatusType = z.infer<typeof VoyageStatusSchema>;
export type ManifestStatusType = z.infer<typeof ManifestStatusSchema>;
export type CrewRoleType = z.infer<typeof CrewRoleSchema>;
export type IncidentTypeType = z.infer<typeof IncidentTypeSchema>;
export type IncidentSeverityType = z.infer<typeof IncidentSeveritySchema>;
export type VoyageSearchInput = z.infer<typeof VoyageSearchSchema>;
export type CreateVoyageInput = z.infer<typeof CreateVoyageSchema>;
export type UpdateVoyageInput = z.infer<typeof UpdateVoyageSchema>;
export type StatusTransitionInput = z.infer<typeof StatusTransitionSchema>;
export type AssignCrewInput = z.infer<typeof AssignCrewSchema>;
export type RemoveCrewInput = z.infer<typeof RemoveCrewSchema>;
export type GenerateManifestInput = z.infer<typeof GenerateManifestSchema>;
export type CheckInInput = z.infer<typeof CheckInSchema>;
export type BoardingInput = z.infer<typeof BoardingSchema>;
export type CreateIncidentInput = z.infer<typeof CreateIncidentSchema>;
export type CreateCrewMemberInput = z.infer<typeof CreateCrewMemberSchema>;
export type UpdateCrewMemberInput = z.infer<typeof UpdateCrewMemberSchema>;