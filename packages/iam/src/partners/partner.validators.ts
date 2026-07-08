import { z } from "zod";

export const CreatePartnerSchema = z.object({
  userId: z.string().uuid("Valid user ID is required"),
  partnerCode: z.string().min(2, "Partner code must be at least 2 characters"),
  companyName: z.string().optional().nullable(),
  commissionRate: z.number().min(0).max(100),
});

export type CreatePartnerInput = z.infer<typeof CreatePartnerSchema>;

export const UpdatePartnerSchema = z.object({
  companyName: z.string().optional().nullable(),
  commissionRate: z.number().min(0).max(100).optional(),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "TERMINATED"]).optional(),
});

export type UpdatePartnerInput = z.infer<typeof UpdatePartnerSchema>;

export const AddPayoutAccountSchema = z.object({
  partnerId: z.string().uuid("Valid partner ID is required"),
  accountName: z.string().min(1, "Account name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  bankName: z.string().optional().nullable(),
  mpesaNumber: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
});

export type AddPayoutAccountInput = z.infer<typeof AddPayoutAccountSchema>;
