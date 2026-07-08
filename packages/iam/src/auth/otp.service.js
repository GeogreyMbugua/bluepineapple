import crypto from "crypto";
import { otpRepository, userRepository } from "@blue-pineapple/database";
import { auditService } from "../audit/audit.service";
import { UnauthorizedError } from "../authorization/errors";
import { notificationService } from "../adapters";
import { eventBus } from "../events";
import { rateLimiter, OtpRateLimiter } from "../utils/rate-limiter";
export class OtpService {
    /**
     * Generate and send OTP token for LOGIN purpose
     */
    async generateLoginOtp(identifier) {
        const rateLimitKey = OtpRateLimiter.key(identifier);
        const rateCheck = await rateLimiter.check(rateLimitKey, {
            limit: OtpRateLimiter.limit,
            windowMs: OtpRateLimiter.windowMs,
        });
        if (!rateCheck.allowed) {
            throw new UnauthorizedError(`Too many OTP requests. Try again in ${rateCheck.resetAt}`);
        }
        // Find user by email or phone
        let user = await userRepository.findByEmail(identifier);
        if (!user) {
            user = await userRepository.findByPhone(identifier);
        }
        if (!user) {
            // For security, don't reveal if user exists
            throw new UnauthorizedError("Invalid identifier");
        }
        // Generate random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
        // Invalidate previous OTPs
        await otpRepository.invalidateAllActive(user.id, "LOGIN");
        // Store new OTP
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await otpRepository.create({
            userId: user.id,
            hashedOtp,
            purpose: "LOGIN",
            expiresAt,
        });
        await auditService.logOtpSent(user.id, "LOGIN", "SMS", {
            ipAddress: undefined,
            userAgent: undefined,
        });
        await notificationService.send({
            to: identifier,
            body: `Your login OTP is: ${otp}`,
            purpose: "LOGIN",
            subject: "Your verification code",
        });
        eventBus.emit("otp.sent", { userId: user.id, identifier, purpose: "LOGIN", channel: "SMS" });
        return { expiresAt: expiresAt.toISOString() };
    }
    /**
     * Verify OTP token
     */
    async verifyLoginOtp(identifier, otpCode) {
        // Find user
        let user = await userRepository.findByEmail(identifier);
        if (!user) {
            user = await userRepository.findByPhone(identifier);
        }
        if (!user) {
            throw new UnauthorizedError("Invalid identifier");
        }
        // Find active OTP
        const active = await otpRepository.findLatestActive(user.id, "LOGIN");
        if (!active) {
            await auditService.logLoginFailure(identifier, "OTP_EXPIRED_OR_INVALID", "No active OTP found");
            throw new UnauthorizedError("OTP expired or invalid");
        }
        // Compare OTP
        const hashedInput = crypto
            .createHash("sha256")
            .update(otpCode)
            .digest("hex");
        if (hashedInput !== active.hashedOtp) {
            await auditService.logLoginFailure(identifier, "OTP_MISMATCH", "Provided OTP does not match");
            throw new UnauthorizedError("Invalid OTP");
        }
        // Mark as used
        await otpRepository.markAsUsed(active.id);
        await auditService.logOtpVerified(user.id, "LOGIN");
        await auditService.logLoginSuccess(user.id, {
            email: user.email ?? undefined,
            phone: user.phone ?? undefined,
        });
        eventBus.emit("otp.verified", { userId: user.id, purpose: "LOGIN" });
        return { userId: user.id };
    }
}
export const otpService = new OtpService();
