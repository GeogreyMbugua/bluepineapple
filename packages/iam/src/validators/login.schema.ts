import { z } from "zod";

export const RequestOtpSchema = z.object({
  identifier: z.string().min(1, "Identifier is required"),
});

export type RequestOtpInput = z.infer<typeof RequestOtpSchema>;
