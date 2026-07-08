import type { ReadinessCheckType } from "@prisma/client";

export const VOYAGE_STATUS = {
  PLANNED: "PLANNED" as const,
  READY: "READY" as const,
  BOARDING: "BOARDING" as const,
  DEPARTED: "DEPARTED" as const,
  ARRIVED: "ARRIVED" as const,
  COMPLETED: "COMPLETED" as const,
  CANCELLED: "CANCELLED" as const,
  ABORTED: "ABORTED" as const,
} as const;

export const MANIFEST_STATUS = {
  RESERVED: "RESERVED" as const,
  CHECKED_IN: "CHECKED_IN" as const,
  BOARDED: "BOARDED" as const,
  ON_VOYAGE: "ON_VOYAGE" as const,
  COMPLETED: "COMPLETED" as const,
  NO_SHOW: "NO_SHOW" as const,
  CANCELLED: "CANCELLED" as const,
} as const;

export const READINESS_CHECKS: ReadinessCheckType[] = [
  "CREW_ASSIGNED" as ReadinessCheckType,
  "MAINTENANCE_COMPLETE" as ReadinessCheckType,
  "INSPECTION_COMPLETE" as ReadinessCheckType,
  "FUEL_CONFIRMED" as ReadinessCheckType,
  "SAFETY_EQUIPMENT_CONFIRMED" as ReadinessCheckType,
  "WEATHER_ACCEPTABLE" as ReadinessCheckType,
];