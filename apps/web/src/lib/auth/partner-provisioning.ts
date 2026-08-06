import { partnerRepository, userRepository } from '@blue-pineapple/database';

/**
 * Generates a unique partner referral code with the format P-XXXXXX.
 * Retries up to 5 times before falling back to a timestamp-based code.
 */
export async function generatePartnerCode(): Promise<string> {
  const prefix = 'P-';
  for (let i = 0; i < 5; i++) {
    const randomCode = prefix + Math.random().toString(36).substring(2, 8).toUpperCase();
    const existing = await partnerRepository.findByPartnerCode(randomCode);
    if (!existing) return randomCode;
  }
  return prefix + Date.now().toString(36).toUpperCase();
}

/**
 * Idempotently ensures a PartnerProfile exists for the given user.
 * Safe to call multiple times — will no-op if the profile already exists.
 *
 * Should NOT be called for ADMIN / SUPER_ADMIN users.
 */
export async function ensurePartnerProfile(userId: string, name?: string): Promise<void> {
  const existing = await partnerRepository.findByUserId(userId);
  if (!existing) {
    const partnerCode = await generatePartnerCode();
    const companyName = name && name.trim() ? name.trim() : `Partner ${partnerCode}`;
    await partnerRepository.create({
      user: { connect: { id: userId } },
      partnerCode,
      companyName,
      commissionRate: 10,
      status: 'ACTIVE',
    });
  }
}

/**
 * Ensures the user has the PARTNER role assigned.
 * No-ops if the role is already present.
 */
export async function ensurePartnerRole(userId: string): Promise<void> {
  await userRepository.assignRole(userId, 'PARTNER');
}

/**
 * Returns true if the given user has an administrative role.
 * Used to guard against creating PartnerProfiles for admin accounts.
 */
export function isAdminRoleSet(roleNames: string[]): boolean {
  return roleNames.some((r) => r === 'ADMIN' || r === 'SUPER_ADMIN');
}
