import { partnerService } from '@blue-pineapple/iam';
import type { PartnerPayoutAccountData } from '@blue-pineapple/iam';
import type { PartnerRow } from '@/components/admin/types';
import type { PartnerDetail, PartnerListResult } from '@/lib/queries/admin/partners';

function maskSensitiveValue(value: string | null): string | null {
  if (!value) return null;
  return `••••${value.slice(-4)}`;
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function mapPartnerListRow(partner: Awaited<
  ReturnType<typeof partnerService.list>
>['partners'][number]): PartnerRow {
  return {
    id: partner.id,
    partnerCode: partner.partnerCode,
    companyName: partner.companyName,
    status: partner.status,
    commissionRate: Number(partner.commissionRate),
    joinedAt: toIsoString(partner.joinedAt),
    userId: partner.userId,
    contactName: partner.user
      ? `${partner.user.firstName} ${partner.user.lastName}`.trim()
      : null,
    email: partner.user?.email ?? null,
    phone: partner.user?.phone ?? null,
    userStatus: partner.user?.status ?? null,
    clerkLinked: Boolean(partner.user?.clerkUserId),
    bookingCount: partner._count.bookings,
    rewardCount: partner._count.partnerRewards,
  };
}

export function mapPartnerDetail(
  partner: NonNullable<Awaited<ReturnType<typeof partnerService.findById>>>,
): PartnerDetail {
  return {
    id: partner.id,
    partnerCode: partner.partnerCode,
    companyName: partner.companyName,
    status: partner.status,
    commissionRate: Number(partner.commissionRate),
    joinedAt: toIsoString(partner.joinedAt),
    userId: partner.userId,
    contactName: partner.user
      ? `${partner.user.firstName} ${partner.user.lastName}`.trim()
      : null,
    email: partner.user?.email ?? null,
    phone: partner.user?.phone ?? null,
    userStatus: partner.user?.status ?? null,
    clerkLinked: Boolean(partner.user?.clerkUserId),
    bookingCount: partner._count.bookings,
    rewardCount: partner._count.partnerRewards,
    createdAt: toIsoString(partner.createdAt),
    updatedAt: toIsoString(partner.updatedAt),
    user: partner.user
      ? {
          id: partner.user.id,
          email: partner.user.email,
          phone: partner.user.phone,
          firstName: partner.user.firstName,
          lastName: partner.user.lastName,
          status: partner.user.status,
          clerkUserId: partner.user.clerkUserId,
        }
      : undefined,
    payoutAccounts: partner.payoutAccounts.map(
      (account): PartnerPayoutAccountData => ({
        ...account,
        accountNumber: maskSensitiveValue(account.accountNumber),
        mpesaNumber: maskSensitiveValue(account.mpesaNumber),
      }),
    ),
    statusHistory: partner.statusHistory.map((entry) => ({
      oldStatus: entry.oldStatus,
      newStatus: entry.newStatus,
      reason: entry.reason,
      createdAt: toIsoString(entry.createdAt),
    })),
  };
}

export async function getAdminPartnersList(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<PartnerListResult> {
  const { status, search, page = 1, limit = 20 } = params;
  const listParams = {
    page,
    limit,
    ...(status && status !== 'ALL'
      ? { status: status as 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' }
      : {}),
    ...(search?.trim() ? { search: search.trim() } : {}),
  };

  const result = await partnerService.list(listParams);

  return {
    partners: result.partners.map(mapPartnerListRow),
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: Math.ceil(result.total / result.limit),
    statusCounts: result.statusCounts as Record<string, number>,
  };
}

export async function getAdminPartnerDetail(partnerId: string): Promise<PartnerDetail> {
  const partner = await partnerService.findById(partnerId);
  if (!partner) {
    throw new Error('Partner not found');
  }
  return mapPartnerDetail(partner);
}
