import { prisma } from "../client";
import type { OtpToken, OtpPurpose } from "@prisma/client";

export class OtpRepository {
  /**
   * Store a newly generated and hashed OTP token.
   */
  async create(data: {
    userId: string;
    hashedOtp: string;
    purpose: OtpPurpose;
    expiresAt: Date;
  }): Promise<OtpToken> {
    return prisma.otpToken.create({
      data: {
        userId: data.userId,
        hashedOtp: data.hashedOtp,
        purpose: data.purpose,
        expiresAt: data.expiresAt,
      },
    });
  }

  /**
   * Find the latest active (non-expired, non-used) OTP token for a user and purpose.
   */
  async findLatestActive(userId: string, purpose: OtpPurpose): Promise<OtpToken | null> {
    return prisma.otpToken.findFirst({
      where: {
        userId,
        purpose,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Mark an OTP token as used.
   */
  async markAsUsed(id: string): Promise<OtpToken> {
    return prisma.otpToken.update({
      where: { id },
      data: {
        usedAt: new Date(),
      },
    });
  }

  /**
   * Deactivates all previous active OTPs for a user and purpose (e.g. when requesting a new one).
   */
  async invalidateAllActive(userId: string, purpose: OtpPurpose): Promise<void> {
    await prisma.otpToken.updateMany({
      where: {
        userId,
        purpose,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        expiresAt: new Date(), // Set expiresAt to now to invalidate
      },
    });
  }
}

export const otpRepository = new OtpRepository();
