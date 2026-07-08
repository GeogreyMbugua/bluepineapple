import type { VesselMaintenanceLog, VesselStatus, VesselType } from "@prisma/client";

export interface VesselData {
  id: string;
  name: string;
  registration?: string | null;
  capacity: number;
  status: VesselStatus;
  type?: VesselType | null;
  operatorName?: string | null;
  ownerName?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VesselWithHistory extends VesselData {
  departures: any[];
  maintenanceLogs: VesselMaintenanceLog[];
}

export interface MaintenanceLogData {
  id: string;
  vesselId: string;
  description: string;
  performedAt: Date;
  createdAt: Date;
}

export interface VesselCreateInput {
  name: string;
  registration?: string | null;
  capacity: number;
  type?: VesselType | null;
  operatorName?: string | null;
  ownerName?: string | null;
  notes?: string | null;
}

export interface VesselUpdateInput {
  name?: string;
  registration?: string | null;
  capacity?: number;
  type?: VesselType | null;
  operatorName?: string | null;
  ownerName?: string | null;
  notes?: string | null;
}

export interface MaintenanceLogInput {
  description: string;
  performedAt: Date;
}

export interface MaintenanceLogUpdateInput {
  description?: string;
  performedAt?: Date;
}

export interface FleetAvailabilityInput {
  from: Date;
  to: Date;
}
