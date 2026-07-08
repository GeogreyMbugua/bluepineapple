export const VESSEL_STATUS = {
  ACTIVE: "ACTIVE" as const,
  INACTIVE: "INACTIVE" as const,
  MAINTENANCE: "MAINTENANCE" as const,
  DECOMMISSIONED: "DECOMMISSIONED" as const,
} as const;

export type VesselStatusValue = typeof VESSEL_STATUS[keyof typeof VESSEL_STATUS];

export const VESSEL_TYPE = {
  FERRY: "FERRY" as const,
  SPEEDBOAT: "SPEEDBOAT" as const,
  DHOW: "DHOW" as const,
  CATAMARAN: "CATAMARAN" as const,
  CATAMARAN_LUXURY: "CATAMARAN_LUXURY" as const,
} as const;

export type VesselTypeValue = typeof VESSEL_TYPE[keyof typeof VESSEL_TYPE];

export const VESSEL_ACTIVE_STATUSES: string[] = [
  VESSEL_STATUS.ACTIVE,
];

export const VESSEL_NON_MODIFIABLE_STATUSES: string[] = [
  VESSEL_STATUS.DECOMMISSIONED,
];
