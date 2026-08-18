import type { Voyage, ManifestEntry, CrewMember, Incident } from '@/lib/services/operations.service';

export type { Voyage, ManifestEntry, CrewMember, Incident };

export interface VoyageStatus {
  value: Voyage['status'];
  label: string;
  color: string;
}

export const VOYAGE_STATUSES: VoyageStatus[] = [
  { value: 'PLANNED', label: 'Planned', color: 'bg-gray-100 text-gray-700' },
  { value: 'READY', label: 'Ready', color: 'bg-blue-100 text-blue-700' },
  { value: 'BOARDING', label: 'Boarding', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'DEPARTED', label: 'Departed', color: 'bg-green-100 text-green-700' },
  { value: 'ARRIVED', label: 'Arrived', color: 'bg-green-100 text-green-700' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-gray-100 text-gray-700' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  { value: 'ABORTED', label: 'Aborted', color: 'bg-red-100 text-red-700' },
];

export function getVoyageStatusColor(status: Voyage['status']): string {
  const found = VOYAGE_STATUSES.find((s) => s.value === status);
  return found?.color ?? 'bg-gray-100 text-gray-600';
}

export interface ManifestStatus {
  value: ManifestEntry['status'];
  label: string;
  color: string;
}

export const MANIFEST_STATUSES: ManifestStatus[] = [
  { value: 'RESERVED', label: 'Reserved', color: 'bg-gray-100 text-gray-700' },
  { value: 'CHECKED_IN', label: 'Checked In', color: 'bg-blue-100 text-blue-700' },
  { value: 'BOARDED', label: 'Boarded', color: 'bg-green-100 text-green-700' },
  { value: 'ON_VOYAGE', label: 'On Voyage', color: 'bg-green-100 text-green-700' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-gray-100 text-gray-700' },
  { value: 'NO_SHOW', label: 'No Show', color: 'bg-red-100 text-red-700' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
];

export function getManifestStatusColor(status: ManifestEntry['status']): string {
  const found = MANIFEST_STATUSES.find((s) => s.value === status);
  return found?.color ?? 'bg-gray-100 text-gray-600';
}

export interface CrewRole {
  value: string;
  label: string;
}

export const CREW_ROLES: CrewRole[] = [
  { value: 'CAPTAIN', label: 'Captain' },
  { value: 'DECKHAND', label: 'Deckhand' },
  { value: 'GUIDE', label: 'Guide' },
  { value: 'ENGINEER', label: 'Engineer' },
  { value: 'OPERATIONS_MANAGER', label: 'Operations Manager' },
];

export interface IncidentType {
  value: Incident['type'];
  label: string;
}

export const INCIDENT_TYPES: IncidentType[] = [
  { value: 'MEDICAL', label: 'Medical' },
  { value: 'MECHANICAL', label: 'Mechanical' },
  { value: 'WEATHER', label: 'Weather' },
  { value: 'PASSENGER', label: 'Passenger' },
  { value: 'SAFETY', label: 'Safety' },
  { value: 'NAVIGATION', label: 'Navigation' },
];

export interface IncidentSeverity {
  value: Incident['severity'];
  label: string;
  color: string;
}

export const INCIDENT_SEVERITIES: IncidentSeverity[] = [
  { value: 'LOW', label: 'Low', color: 'bg-green-100 text-green-700' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-700' },
];