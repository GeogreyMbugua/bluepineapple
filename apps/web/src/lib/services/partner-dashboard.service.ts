import { prisma } from '@blue-pineapple/database';
import type { Prisma, BookingStatus } from '@blue-pineapple/database';

interface UserNames {
  firstName: string | null | undefined;
  lastName: string | null | undefined;
}

export interface PartnerDashboardKpis {
  totalBookings: number;
  totalGuests: number;
  revenue: number;
  commission: number;
  commissionRate: number;
}

export interface PartnerBookingRow {
  id: string;
  bookingReference: string;
  experience: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  totalGuests: number;
  createdAt: string;
}

export interface PartnerProfileRow {
  id: string;
  partnerCode: string;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  commissionRate: number;
  status: string;
  userId: string;
}

export interface PartnerDashboardData {
  kpis: PartnerDashboardKpis;
  bookings: PartnerBookingRow[];
  profile: PartnerProfileRow;
  totalBookings: number;
}

async function findPartnerProfile(userId: string, user?: UserNames) {
  return prisma.partnerProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      partnerCode: true,
      companyName: true,
      commissionRate: true,
      status: true,
      userId: true,
      ...(user
        ? {}
        : {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          }),
    },
  });
}

export async function getPartnerDashboardData(
  userId: string,
  user?: UserNames,
  status?: string,
): Promise<PartnerDashboardData | null> {
  try {
    const partnerProfile = await findPartnerProfile(userId, user);
    if (!partnerProfile) return null;

    const where: Prisma.BookingWhereInput = { partnerId: partnerProfile.id };
    if (status && status !== 'ALL') {
      where.status = status as BookingStatus;
    }

    const [allBookings, recentBookings] = await Promise.all([
      prisma.booking.findMany({
        where,
        select: {
          totalAmount: true,
          totalGuests: true,
        },
      }),
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          bookingReference: true,
          status: true,
          paymentStatus: true,
          totalAmount: true,
          totalGuests: true,
          createdAt: true,
          departure: {
            select: {
              experience: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    const commissionRate = Number(partnerProfile.commissionRate);
    const totalBookings = allBookings.length;
    const totalGuests = allBookings.reduce((sum, b) => sum + b.totalGuests, 0);
    const revenue = allBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    const commission = revenue * (commissionRate / 100);

    const profile: PartnerProfileRow = {
      id: partnerProfile.id,
      partnerCode: partnerProfile.partnerCode,
      companyName: partnerProfile.companyName,
      firstName: user?.firstName ?? partnerProfile.user?.firstName ?? null,
      lastName: user?.lastName ?? partnerProfile.user?.lastName ?? null,
      commissionRate,
      status: partnerProfile.status,
      userId: partnerProfile.userId,
    };

    return {
      kpis: {
        totalBookings,
        totalGuests,
        revenue,
        commission,
        commissionRate,
      },
      bookings: recentBookings.map((b) => ({
        id: b.id,
        bookingReference: b.bookingReference,
        experience: b.departure?.experience?.name ?? 'Unknown',
        status: b.status,
        paymentStatus: b.paymentStatus,
        totalAmount: Number(b.totalAmount),
        totalGuests: b.totalGuests,
        createdAt: b.createdAt.toISOString(),
      })),
      profile,
      totalBookings,
    };
  } catch (error) {
    console.error('[PartnerDashboardService] getPartnerDashboardData error:', error);
    return null;
  }
}

export async function getPartnerBookingsList(
  userId: string,
  limit = 50,
  offset = 0,
  user?: UserNames,
): Promise<PartnerBookingRow[]> {
  try {
    const partnerProfile = await findPartnerProfile(userId, user);
    if (!partnerProfile) return [];

    const bookings = await prisma.booking.findMany({
      where: { partnerId: partnerProfile.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        bookingReference: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        totalGuests: true,
        createdAt: true,
        departure: {
          select: {
            experience: { select: { name: true } },
          },
        },
      },
    });

    return bookings.map((b) => ({
      id: b.id,
      bookingReference: b.bookingReference,
      experience: b.departure?.experience?.name ?? 'Unknown',
      status: b.status,
      paymentStatus: b.paymentStatus,
      totalAmount: Number(b.totalAmount),
      totalGuests: b.totalGuests,
      createdAt: b.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('[PartnerDashboardService] getPartnerBookingsList error:', error);
    return [];
  }
}

export async function getPartnerProfile(
  userId: string,
  user?: UserNames,
): Promise<PartnerProfileRow | null> {
  try {
    const partnerProfile = await findPartnerProfile(userId, user);
    if (!partnerProfile) return null;

    return {
      id: partnerProfile.id,
      partnerCode: partnerProfile.partnerCode,
      companyName: partnerProfile.companyName,
      firstName: user?.firstName ?? partnerProfile.user?.firstName ?? null,
      lastName: user?.lastName ?? partnerProfile.user?.lastName ?? null,
      commissionRate: Number(partnerProfile.commissionRate),
      status: partnerProfile.status,
      userId: partnerProfile.userId,
    };
  } catch (error) {
    console.error('[PartnerDashboardService] getPartnerProfile error:', error);
    return null;
  }
}

export async function getPartnerRewardSummary(
  userId: string,
  year: number,
  user?: UserNames,
): Promise<{
  partnerId: string;
  year: number;
  bookingCount: number;
  tier: string | null;
  discountPercentage: number;
  isRewarded: boolean;
  rewardStatus: string | null;
  voucherCode: string | null;
  bookingsToNextTier: number;
  nextTier: string | null;
} | null> {
  try {
    const partnerProfile = await findPartnerProfile(userId, user);
    if (!partnerProfile) return null;

    const { partnerRewardService } = await import('@blue-pineapple/iam');
    return partnerRewardService.getPartnerRewardSummary(partnerProfile.id, year);
  } catch (error) {
    console.error('[PartnerDashboardService] getPartnerRewardSummary error:', error);
    return null;
  }
}
