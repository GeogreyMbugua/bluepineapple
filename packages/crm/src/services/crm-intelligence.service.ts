import {
  prisma,
  customerRepository,
} from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import type { CustomerInsights } from "../domain/crm.types";
import type { CustomerIntelligenceUpdatedEvent } from "../events/crm.events";

export class CRMIntelligenceService {
  async getCustomerInsights(customerId: string): Promise<CustomerInsights | null> {
    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      return null;
    }

    const cancellationRate = customer.totalBookings > 0
      ? (customer.totalTripsCancelled / customer.totalBookings) * 100
      : 0;

    const loyaltyAccount = customer.loyaltyAccount;

    const segmentAssignments = await prisma.customerSegmentAssignment.findMany({
      where: { customerId },
      include: { segment: true },
    });

    return {
      customerId: customer.id,
      lifetimeValue: Number(customer.lifetimeValue),
      totalSpend: Number(customer.totalSpend),
      totalBookings: customer.totalBookings,
      totalTripsCompleted: customer.totalTripsCompleted,
      totalTripsCancelled: customer.totalTripsCancelled,
      cancellationRate: Math.round(cancellationRate * 100) / 100,
      averageSpendPerTrip: customer.totalTripsCompleted > 0
        ? Number(customer.totalSpend) / customer.totalTripsCompleted
        : 0,
      averageGroupSize: 0,
      lastVisit: customer.lastVisitAt ?? undefined,
      nextBooking: customer.nextAppointmentAt ?? undefined,
      totalRewardsEarned: Number(customer.totalRewardsEarned),
      referralCount: customer.referralCount,
      isCorporate: customer.isCorporate,
      isVip: customer.isVip,
      loyaltyTier: loyaltyAccount?.tier?.name,
      loyaltyPoints: loyaltyAccount?.pointsBalance ?? 0,
      outstandingBalance: Number(customer.outstandingBalance),
      segmentNames: segmentAssignments.map((s) => s.segment.name),
    };
  }

  async getTopCustomers(limit = 50) {
    const customers = await customerRepository.findTopCustomers(limit);
    return customers.map((c) => ({
      id: c.id,
      customerNumber: c.customerNumber,
      name: `${c.firstName} ${c.lastName}`,
      lifetimeValue: Number(c.lifetimeValue),
      totalBookings: c.totalBookings,
    }));
  }

  async getSegmentAnalytics() {
    const segments = await prisma.customerSegment.findMany({
      include: {
        _count: { select: { assignments: true } },
      },
    });

    return segments.map((segment) => ({
      id: segment.id,
      name: segment.name,
      code: segment.code,
      customerCount: segment._count.assignments,
      isActive: segment.isActive,
    }));
  }

  async getLoyaltyAnalytics() {
    const tiers = await prisma.loyaltyTier.findMany({
      orderBy: { level: "asc" },
    });

    const totalAccounts = await prisma.loyaltyAccount.count();

    const tierStats = await Promise.all(
      tiers.map(async (tier) => {
        const count = await prisma.loyaltyAccount.count({
          where: { tierId: tier.id },
        });
        return {
          tierId: tier.id,
          tierName: tier.name,
          tierCode: tier.code,
          customerCount: count,
        };
      })
    );

    return {
      totalAccounts,
      tiers: tierStats,
    };
  }

  async getConsentAnalytics() {
    const [totalCustomers, totalConsented, totalMarketingConsented] = await Promise.all([
      prisma.customer.count({ where: { status: "ACTIVE" } }),
      prisma.customerConsent.count(),
      prisma.customerConsent.count({
        where: {
          consentType: {
            in: ["MARKETING_EMAIL", "MARKETING_SMS", "MARKETING_WHATSAPP"],
          },
          isGranted: true,
        },
      }),
    ]);

    return {
      totalCustomers,
      totalConsented,
      marketingConsentRate: totalCustomers > 0 ? (totalMarketingConsented / totalCustomers) * 100 : 0,
    };
  }

  async recalculateIntelligence(customerId: string, actorId?: string) {
    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    const bookingStats = await prisma.booking.aggregate({
      where: { guestId: customerId },
      _sum: { totalAmount: true },
      _count: true,
    });

    const completedBookings = await prisma.booking.count({
      where: { guestId: customerId, status: "COMPLETED" },
    });

    const cancelledBookings = await prisma.booking.count({
      where: { guestId: customerId, status: "CANCELLED" },
    });

    const totalSpend = Number(bookingStats._sum.totalAmount ?? 0);

    const updated = await customerRepository.updateIntelligence(customerId, {
      totalSpend,
      totalBookings: bookingStats._count,
      totalTripsCompleted: completedBookings,
      totalTripsCancelled: cancelledBookings,
    });

    (eventBus as any).emit("customer.intelligence.updated", {
      customerId,
      lifetimeValue: totalSpend,
      totalBookings: bookingStats._count,
      totalTripsCompleted: completedBookings,
    } as CustomerIntelligenceUpdatedEvent);

    return updated;
  }
}

export const crmIntelligenceService = new CRMIntelligenceService();
