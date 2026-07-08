export {
  VesselService,
  vesselService,
} from "./vessel.service";
export {
  MaintenanceService,
  maintenanceService,
} from "./maintenance.service";

export {
  CreateVesselSchema,
  UpdateVesselSchema,
  MaintenanceLogSchema,
  UpdateMaintenanceLogSchema,
  FleetAvailabilitySchema,
} from "./fleet.validators";

export type {
  CreateVesselInput,
  UpdateVesselInput,
  MaintenanceLogInput,
  UpdateMaintenanceLogInput,
  FleetAvailabilityInput,
} from "./fleet.validators";

export type {
  VesselData,
  VesselWithHistory,
  MaintenanceLogData,
} from "./vessel.types";

export type {
  VesselCreatedEvent,
  VesselUpdatedEvent,
  VesselActivatedEvent,
  VesselDeactivatedEvent,
  VesselDecommissionedEvent,
  VesselMaintenanceScheduledEvent,
  VesselMaintenanceCompletedEvent,
} from "./fleet.events";
