import { prisma } from '@blue-pineapple/database';
import { toPlainNumber } from '@/lib/admin/serialize';

export interface PartnerStatsRow {
  id: string;
  partnerCode: string;
  companyName: string | null;
  email: string | null | undefined;
  contactName: string | null;
  status: string;
  joinedAt: string;
  yearlyBookings: number;
  commissionRate: number;
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

export async function getAdminPartnerStats(): Promise<PartnerStatsRow[]> {
  const partners = await prisma.partnerProfile.findMany({
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      bookings: {
        where: {
          status: { in: ['CONFIRMED', 'COMPLETED'] },
          createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) },
        },
        select: { id: true },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });

  return partners.map((partner) => ({
    id: partner.id,
    partnerCode: partner.partnerCode,
    companyName: partner.companyName,
    email: partner.user?.email,
    contactName: partner.user ? `${partner.user.firstName} ${partner.user.lastName}` : null,
    status: partner.status,
    joinedAt: toIsoString(partner.joinedAt),
    yearlyBookings: partner.bookings.length,
    commissionRate: toPlainNumber(partner.commissionRate) ?? 0,
  }));
}
