'use client';

import { operationsApi } from '@/features/operations/services/api';

export function useVoyages(params?: {
  status?: string;
  vesselId?: string;
  from?: string;
  to?: string;
  limit?: number;
  experienceSlug?: string;
}) {
  return operationsApi.voyages.list(params);
}

export function useVoyage(id: string) {
  return operationsApi.voyages.detail(id);
}

export function useVoyageActions() {
  const createVoyage = async (data: {
    departureId: string;
    vesselId: string;
    routeId: string;
    captainId?: string;
    operationalNotes?: string;
  }) => {
    return operationsApi.voyages.create(data);
  };

  const updateStatus = async (id: string, data: { status: string; reason?: string }) => {
    return operationsApi.voyages.updateStatus(id, data);
  };

  const assignCrew = async (id: string, data: { crewMemberId: string; crewRole: string }) => {
    return operationsApi.voyages.assignCrew(id, data);
  };

  const removeCrew = async (id: string, crewMemberId: string) => {
    return operationsApi.voyages.removeCrew(id, crewMemberId);
  };

  const generateManifest = async (id: string) => {
    return operationsApi.voyages.generateManifest(id);
  };

  const reportIncident = async (data: {
    voyageId: string;
    type: string;
    severity?: string;
    description: string;
    metadata?: unknown;
  }) => {
    return operationsApi.incidents.report(data);
  };

  return {
    createVoyage,
    updateStatus,
    assignCrew,
    removeCrew,
    generateManifest,
    reportIncident,
  };
}

export function useCrewMembers() {
  return operationsApi.crew.list();
}

export function useIncidents(params?: { voyageId?: string; severity?: string }) {
  return operationsApi.incidents.list(params?.voyageId, params?.severity);
}
