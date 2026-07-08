export interface VesselCreatedEvent {
  vesselId: string;
  vesselName: string;
  registration?: string;
}

export interface VesselUpdatedEvent {
  vesselId: string;
  vesselName: string;
}

export interface VesselActivatedEvent {
  vesselId: string;
  vesselName: string;
}

export interface VesselDeactivatedEvent {
  vesselId: string;
  vesselName: string;
}

export interface VesselDecommissionedEvent {
  vesselId: string;
  vesselName: string;
}

export interface VesselMaintenanceScheduledEvent {
  vesselId: string;
  vesselName: string;
  maintenanceLogId: string;
  performedAt: string;
}

export interface VesselMaintenanceCompletedEvent {
  vesselId: string;
  vesselName: string;
  maintenanceLogId: string;
}
