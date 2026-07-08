import { z } from "zod";
export const CreateBookingSchema = z.object({
    departureId: z.string().uuid("Valid departure ID is required"),
    partnerId: z.string().uuid("Valid partner ID is required"),
    guestId: z.string().uuid().optional().nullable(),
    guest: z
        .object({
        firstName: z.string().min(1).max(100),
        lastName: z.string().min(1).max(100),
        email: z.string().email().optional().nullable(),
        phone: z.string().min(7).max(20).optional().nullable(),
    })
        .optional(),
    totalGuests: z.number().int().positive("Total guests must be at least 1"),
    totalAmount: z.number().nonnegative("Total amount cannot be negative"),
    pickupStopId: z.string().uuid().optional().nullable(),
    specialRequests: z.string().max(2000).optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
    idempotencyKey: z.string().max(200).optional().nullable(),
    bookingGuests: z
        .array(z.object({
        fullName: z.string().min(1).max(200),
        idNumber: z.string().optional().nullable(),
        phoneNumber: z.string().optional().nullable(),
        isPrimary: z.boolean().default(false),
    }))
        .optional(),
});
export const UpdateBookingSchema = z.object({
    totalGuests: z.number().int().positive().optional(),
    totalAmount: z.number().nonnegative().optional(),
    pickupStopId: z.string().uuid().optional().nullable(),
    specialRequests: z.string().max(2000).optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
    status: z
        .enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"])
        .optional(),
});
export const BookingSearchSchema = z.object({
    departureId: z.string().uuid().optional(),
    partnerId: z.string().uuid().optional(),
    guestId: z.string().uuid().optional(),
    status: z
        .enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"])
        .optional(),
    source: z
        .enum(["PARTNER", "DIRECT", "ADMIN", "HOTEL", "CORPORATE"])
        .optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
});
export const CancelBookingSchema = z.object({
    reason: z.string().max(500).optional().nullable(),
});
