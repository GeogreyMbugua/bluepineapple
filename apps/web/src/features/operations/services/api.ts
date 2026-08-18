import { apiClient } from '@/services/api';
import type { SuccessResponse } from '@/types/api';

export interface Voyage {
  id: string;
  voyageNumber: string;
  departureId: string | null;
  departureStatus: string | null;
  vesselId: string;
  routeId: string;
  status:
    | 'PLANNED'
    | 'READY'
    | 'BOARDING'
    | 'DEPARTED'
    | 'ARRIVED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'ABORTED';
  scheduledDeparture: string;
  actualDeparture: string | null;
  scheduledArrival: string | null;
  actualArrival: string | null;
  captainId: string | null;
  operationalNotes: string | null;
  weatherSummary: string | null;
  cancellationReason: string | null;
  completionSummary: string | null;
  version: number;
  vessel: { name: string; type: string | null; capacity: number } | null;
  route: { name: string; code: string | null } | null;
  crewAssignments: Array<{
    id: string;
    crewMemberId: string;
    crewRole: string;
    assignedBy: string;
    assignedAt: string;
    crewMember: {
      id: string;
      firstName: string;
      lastName: string;
      crewRole: string;
      isActive: boolean;
    };
  }>;
  manifest: Array<{
    id: string;
    bookingId: string;
    guestId: string;
    status: string;
    guest: { firstName: string; lastName: string; email?: string | null } | null;
    booking: { bookingReference: string; totalGuests: number } | null;
    checkIn: { id: string; boardingGroup: string | null } | null;
    boarding: { id: string; status: string } | null;
  }>;
  readinessChecks: Array<{
    id: string;
    checkType: string;
    status: boolean;
    verifiedBy: string | null;
    verifiedAt: string | null;
    notes: string | null;
  }>;
  incidents: Array<{
    id: string;
    type: string;
    severity: string;
    description: string;
    recordedBy: string;
    recordedAt: string;
  }>;
  timeline: Array<{
    id: string;
    eventType: string;
    eventAt: string;
    userId: string | null;
    notes: string | null;
  }>;
}

export interface CrewMember {
  id: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  crewRole: string;
  licenseNumber: string | null;
  certification: string | null;
  isActive: boolean;
  notes: string | null;
}

export interface ManifestEntry {
  id: string;
  voyageId: string;
  bookingId: string;
  guestId: string;
  status: string;
  checkInId: string | null;
  boardingId: string | null;
  notes: string | null;
  guest: { firstName: string; lastName: string; email?: string | null } | null;
  booking: { bookingReference: string; totalGuests: number; status: string } | null;
  checkIn: { id: string; checkedInAt: string; checkedById: string; boardingGroup: string | null; notes: string | null } | null;
  boarding: { id: string; boardedAt: string; boardedById: string; status: string; notes: string | null } | null;
}

export interface Incident {
  id: string;
  voyageId: string;
  type: string;
  severity: string;
  description: string;
  resolution: string | null;
  recordedBy: string;
  recordedAt: string;
  metadata: unknown;
}

export interface VoyageSearchParams {
  [key: string]: string | number | boolean | undefined;
  status?: string;
  vesselId?: string;
  from?: string;
  to?: string;
  limit?: number;
  experienceSlug?: string;
}

export const operationsApi = {
  voyages: {
    list: (params?: VoyageSearchParams) =>
      apiClient.get<SuccessResponse<Voyage[]>>('/admin/operations/voyages', params ? { params } : undefined),

    detail: (id: string) =>
      apiClient.get<SuccessResponse<Voyage>>(`/admin/operations/voyages/${id}`),

    create: (data: {
      departureId: string;
      vesselId: string;
      routeId: string;
      captainId?: string;
      operationalNotes?: string;
    }) =>
      apiClient.post<SuccessResponse<Voyage>>('/admin/operations/voyages', data),

    updateStatus: (id: string, data: { status: string; reason?: string }) =>
      apiClient.post<SuccessResponse<{ id: string; status: string }>>(
        `/admin/operations/voyages/${id}/status`,
        data
      ),

    assignCrew: (id: string, data: { crewMemberId: string; crewRole: string }) =>
      apiClient.post<SuccessResponse<{ success: boolean }>>(
        `/admin/operations/voyages/${id}/crew`,
        data
      ),

    removeCrew: (id: string, crewMemberId: string) =>
      apiClient.delete<SuccessResponse<{ success: boolean }>>(
        `/admin/operations/voyages/${id}/crew`,
        { params: { crewMemberId } }
      ),

    generateManifest: (id: string) =>
      apiClient.post<SuccessResponse<{ passengerCount: number }>>(
        `/admin/operations/voyages/${id}/manifest`,
        { voyageId: id }
      ),

    getManifest: (id: string) =>
      apiClient.get<SuccessResponse<ManifestEntry[]>>(
        `/admin/operations/voyages/${id}/manifest`
      ),
  },

  manifest: {
    checkIn: (voyageId: string, manifestId: string, data: { boardingGroup?: string; notes?: string }) =>
      apiClient.post<SuccessResponse<{ success: boolean }>>(
        `/admin/operations/voyages/${voyageId}/manifest/${manifestId}/checkin`,
        data
      ),

    undoCheckIn: (voyageId: string, manifestId: string) =>
      apiClient.delete<SuccessResponse<{ success: boolean }>>(
        `/admin/operations/voyages/${voyageId}/manifest/${manifestId}/checkin`
      ),

    board: (voyageId: string, manifestId: string, data: { status?: string; notes?: string }) =>
      apiClient.post<SuccessResponse<{ success: boolean }>>(
        `/admin/operations/voyages/${voyageId}/manifest/${manifestId}/boarding`,
        data
      ),

    undoBoarding: (voyageId: string, manifestId: string) =>
      apiClient.delete<SuccessResponse<{ success: boolean }>>(
        `/admin/operations/voyages/${voyageId}/manifest/${manifestId}/boarding`
      ),
  },

  crew: {
    list: () =>
      apiClient.get<SuccessResponse<CrewMember[]>>('/admin/operations/crew'),

    create: (data: {
      firstName: string;
      lastName: string;
      crewRole: string;
      licenseNumber?: string;
      certification?: string;
      notes?: string;
    }) =>
      apiClient.post<SuccessResponse<CrewMember>>('/admin/operations/crew', data),
  },

  incidents: {
    list: (voyageId?: string, severity?: string) =>
      apiClient.get<SuccessResponse<Incident[]>>('/admin/operations/incidents', {
        params: { voyageId, severity } as Record<string, string>,
      }),

    report: (data: {
      voyageId: string;
      type: string;
      severity?: string;
      description: string;
      metadata?: unknown;
    }) =>
      apiClient.post<SuccessResponse<Incident>>('/admin/operations/incidents', data),
  },
};