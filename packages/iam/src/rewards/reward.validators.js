import { z } from "zod";
export const CreateRewardRuleSchema = z.object({
    name: z.string().min(1, "Rule name is required").max(200),
    description: z.string().max(1000).optional().nullable(),
    pointsPerBooking: z.number().int().nonnegative("Points must be non-negative"),
    cashMultiplier: z.number().min(0).max(1).optional().nullable(),
    currency: z.string().default("KES"),
    effectiveFrom: z.coerce.date(),
    effectiveTo: z.coerce.date().optional().nullable(),
    minGuests: z.number().int().min(1).default(1),
    maxGuests: z.number().int().min(1).optional().nullable(),
    experienceIds: z.array(z.string().uuid()).default([]),
    routeIds: z.array(z.string().uuid()).default([]),
});
export const UpdateRewardRuleSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional().nullable(),
    pointsPerBooking: z.number().int().nonnegative().optional(),
    cashMultiplier: z.number().min(0).max(1).optional().nullable(),
    currency: z.string().optional(),
    isActive: z.boolean().optional(),
    effectiveFrom: z.coerce.date().optional(),
    effectiveTo: z.coerce.date().optional().nullable(),
    minGuests: z.number().int().min(1).optional(),
    maxGuests: z.number().int().min(1).optional().nullable(),
    experienceIds: z.array(z.string().uuid()).optional(),
    routeIds: z.array(z.string().uuid()).optional(),
});
export const RewardSearchSchema = z.object({
    partnerId: z.string().uuid().optional(),
    status: z
        .enum(["PENDING", "APPROVED", "PAID_OUT", "EXPIRED", "REVERSED"])
        .optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
});
