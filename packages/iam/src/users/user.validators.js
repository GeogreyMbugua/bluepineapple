import { z } from "zod";
export const CreateUserSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address").optional().nullable(),
    phone: z.string().optional().nullable(),
});
export const UpdateProfileSchema = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
});
