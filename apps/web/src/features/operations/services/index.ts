export { operationsService } from '@/lib/services/operations.service';
export type { Voyage, ManifestEntry, CrewMember, Incident } from '@/lib/services/operations.service';
export {
  VOYAGE_STATUSES,
  MANIFEST_STATUSES,
  CREW_ROLES,
  INCIDENT_TYPES,
  INCIDENT_SEVERITIES,
  getVoyageStatusColor,
  getManifestStatusColor,
} from '@/features/operations/types';
export type {
  VoyageStatus,
  ManifestStatus,
  CrewRole,
  IncidentType,
  IncidentSeverity,
} from '@/features/operations/types';