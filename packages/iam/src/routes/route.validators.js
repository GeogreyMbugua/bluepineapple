import { z } from "zod";
export const CreateRouteSchema = z.object({
    name: z.string().min(2, "Route name must be at least 2 characters").max(200),
    code: z
        .string()
        .min(2, "Route code must be at least 2 characters")
        .max(20)
        .regex(/^[A-Z0-9-]+$/, "Route code must contain only uppercase letters, numbers, and hyphens"),
    description: z.string().max(2000).optional().nullable(),
    estimatedDurationMinutes: z.number().int().positive().optional().nullable(),
    isActive: z.boolean().default(true),
});
export const UpdateRouteSchema = z.object({
    name: z.string().min(2).max(200).optional(),
    code: z
        .string()
        .min(2)
        .max(20)
        .regex(/^[A-Z0-9-]+$/, "Route code must contain only uppercase letters, numbers, and hyphens")
        .optional(),
    description: z.string().max(2000).optional().nullable(),
    estimatedDurationMinutes: z.number().int().positive().optional().nullable(),
    isActive: z.boolean().optional(),
});
export const AssignStopSchema = z.object({
    name: z.string().min(2, "Stop name must be at least 2 characters").max(200),
    code: z
        .string()
        .max(20)
        .regex(/^[A-Z0-9-]*$/, "Stop code must contain only uppercase letters, numbers, and hyphens")
        .optional()
        .nullable(),
    sequence: z.number().int().positive("Sequence must be a positive integer"),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    isPickupPoint: z.boolean().default(true),
    isDropoffPoint: z.boolean().default(true),
    estimatedArrivalMinutes: z.number().int().nonnegative().optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
});
export const ReorderStopSchema = z.object({
    oldSequence: z.number().int().positive(),
    newSequence: z.number().int().positive(),
});
export const RouteSearchSchema = z.object({
    query: z.string().min(1).max(100),
    limit: z.number().int().positive().max(50).default(20),
});
