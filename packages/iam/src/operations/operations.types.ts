import type {
  VoyageStatus,
  CrewRole,
  CrewAssignment,
  ManifestStatus,
  CheckIn,
  Boarding,
  VesselReadinessCheck,
  ReadinessCheckType,
  OperationalIncident,
  IncidentType,
  IncidentSeverity,
} from "@prisma/client";

export interface VoyageData {
  id: string;
  voyageNumber: string;
  departureId: string;
  vesselId: string;
  routeId: string;
  status: VoyageStatus;
  scheduledDeparture: Date;
  actualDeparture: Date | null;
  scheduledArrival: Date | null;
  actualArrival: Date | null;
  captainId: string | null;
  operationalNotes: string | null;
  weatherSummary: string | null;
  cancellationReason: string | null;
  completionSummary: string | null;
  version: number;
}

export interface VoyageWithDetails extends VoyageData {
  departure: {
    id: string;
    experience?: { id: string; name: string };
    route?: { id: string; name: string; code: string };
    vessel?: { id: string; name: string; capacity: number };
  } | null;
  vessel: { id: string; name: string; capacity: number } | null;
  route: { id: string; name: string; code: string } | null;
  captain: { id: string; firstName: string; lastName: string } | null;
  crewAssignments: CrewAssignmentWithMember[];
  manifest: ManifestWithDetails[];
  incidents: OperationalIncident[];
  timeline: VoyageTimelineEvent[];
  readinessChecks: VesselReadinessCheck[];
}

export interface CrewMemberData {
  id: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  crewRole: CrewRole;
  licenseNumber: string | null;
  certification: string | null;
  isActive: boolean;
  notes: string | null;
}

export interface CrewAssignmentWithMember extends CrewAssignment {
  crewMember: CrewMemberData;
}

export interface ManifestData {
  id: string;
  voyageId: string;
  bookingId: string;
  guestId: string;
  status: ManifestStatus;
  notes: string | null;
  checkIn?: CheckIn | null;
  boarding?: Boarding | null;
}

export interface ManifestWithDetails extends ManifestData {
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
  };
  booking: {
    id: string;
    bookingReference: string;
    totalGuests: number;
    status: string;
  };
}

export interface VoyageTimelineEvent {
  id: string;
  voyageId: string;
  eventType: string;
  eventAt: Date;
  userId: string | null;
  notes: string | null;
  metadata: any;
}

export interface IncidentData {
  id: string;
  voyageId: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  resolution: string | null;
  recordedBy: string;
  recordedAt: Date;
  metadata: any;
}

export interface ReadinessCheckData {
  voyageId: string;
  checkType: ReadinessCheckType;
  status: boolean;
  verifiedBy: string | null;
  verifiedAt: Date | null;
  notes: string | null;
}

export interface VoyageCompletionData {
  actualDurationMinutes: number;
  boardedCount: number;
  completedCount: number;
  noShowCount: number;
  incidentCount: number;
}

export interface ManifestCounts {
  total: number;
  checkedIn: number;
  boarded: number;
  completed: number;
  noShow: number;
  cancelled: number;
}