import { z } from "zod";

export const CreateReviewSchema = z.object({
  experienceId: z.string().uuid("Please select an experience"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(1000),
  guestName: z.string().min(1, "Name is required"),
  guestEmail: z.string().email().optional().nullable(),
  title: z.string().max(120).optional().nullable(),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

export const ReviewQuerySchema = z.object({
  experienceId: z.string().uuid().optional(),
  featured: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export type ReviewQueryInput = z.infer<typeof ReviewQuerySchema>;
