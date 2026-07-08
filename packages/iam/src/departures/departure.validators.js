import { z } from "zod";
export const CreateDepartureSchema = z.object({
    vesselId: z.string().uuid("Valid vessel ID is required"),
    routeId: z.string().uuid("Valid route ID is required"),
    experienceId: z.string().uuid("Valid experience ID is required"),
    departureDateTime: z.coerce.date(),
    arrivalDateTime: z.coerce.date().optional().nullable(),
    totalCapacity: z.number().int().positive("Capacity must be a positive integer"),
    specialInstructions: z.string().max(2000).optional().nullable(),
});
export const UpdateDepartureSchema = z.object({
    vesselId: z.string().uuid().optional(),
    routeId: z.string().uuid().optional(),
    experienceId: z.string().uuid().optional(),
    departureDateTime: z.coerce.date().optional(),
    arrivalDateTime: z.coerce.date().optional().nullable(),
    totalCapacity: z.number().int().positive().optional(),
    specialInstructions: z.string().max(2000).optional().nullable(),
});
export const DepartureSearchSchema = z.object({
    routeId: z.string().uuid().optional(),
    vesselId: z.string().uuid().optional(),
    experienceId: z.string().uuid().optional(),
    status: z
        .enum(["SCHEDULED", "BOARDING", "DEPARTED", "COMPLETED", "CANCELLED"])
        .optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
});
export const AssignVesselSchema = z.object({
    vesselId: z.string().uuid("Valid vessel ID is required"),
});
export const AssignRouteSchema = z.object({
    routeId: z.string().uuid("Valid route ID is required"),
});
export const AssignExperienceSchema = z.object({
    experienceId: z.string().uuid("Valid experience ID is required"),
});
