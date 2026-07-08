import { z } from "zod";

export const CreateGuestSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Valid email is required").optional().nullable(),
  phone: z.string().min(7).max(20).optional().nullable(),
  idNumber: z.string().optional().nullable(),
  nationality: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  dateOfBirth: z.coerce.date().optional().nullable(),
  specialRequests: z.string().max(2000).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  marketingOptIn: z.boolean().default(false),
});

export const UpdateGuestSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(7).max(20).optional().nullable(),
  idNumber: z.string().optional().nullable(),
  nationality: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  dateOfBirth: z.coerce.date().optional().nullable(),
  specialRequests: z.string().max(2000).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  marketingOptIn: z.boolean().optional(),
});

export const GuestSearchSchema = z.object({
  query: z.string().min(1).max(100),
  limit: z.number().int().positive().max(50).default(20),
});

export type CreateGuestInput = z.infer<typeof CreateGuestSchema>;
export type UpdateGuestInput = z.infer<typeof UpdateGuestSchema>;
export type GuestSearchInput = z.infer<typeof GuestSearchSchema>;
