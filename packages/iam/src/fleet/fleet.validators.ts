import { z } from "zod";

export const CreateVesselSchema = z.object({
  name: z.string().min(2, "Vessel name must be at least 2 characters").max(200),
  registration: z.string().max(100).optional().nullable(),
  capacity: z.number().int().positive("Capacity must be a positive integer"),
  type: z.enum(["FERRY", "SPEEDBOAT", "DHOW", "CATAMARAN", "CATAMARAN_LUXURY"]).optional().nullable(),
  operatorName: z.string().max(200).optional().nullable(),
  ownerName: z.string().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const UpdateVesselSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  registration: z.string().max(100).optional().nullable(),
  capacity: z.number().int().positive().optional(),
  type: z.enum(["FERRY", "SPEEDBOAT", "DHOW", "CATAMARAN", "CATAMARAN_LUXURY"]).optional().nullable(),
  operatorName: z.string().max(200).optional().nullable(),
  ownerName: z.string().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const MaintenanceLogSchema = z.object({
  description: z.string().min(1, "Description is required").max(1000),
  performedAt: z.coerce.date(),
});

export const UpdateMaintenanceLogSchema = z.object({
  description: z.string().min(1).max(1000).optional(),
  performedAt: z.coerce.date().optional(),
});

export const FleetAvailabilitySchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export type CreateVesselInput = z.infer<typeof CreateVesselSchema>;
export type UpdateVesselInput = z.infer<typeof UpdateVesselSchema>;
export type MaintenanceLogInput = z.infer<typeof MaintenanceLogSchema>;
export type UpdateMaintenanceLogInput = z.infer<typeof UpdateMaintenanceLogSchema>;
export type FleetAvailabilityInput = z.infer<typeof FleetAvailabilitySchema>;
