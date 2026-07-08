import { z } from "zod";
export const VerifyOtpSchema = z.object({
    identifier: z.string().min(1, "Identifier is required"),
    otpCode: z.string().length(6, "OTP must be exactly 6 digits"),
});
