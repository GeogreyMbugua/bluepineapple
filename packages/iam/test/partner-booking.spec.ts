import { describe, it, expect, vi, beforeEach } from "vitest";

function setupMocks() {
  vi.doMock("@blue-pineapple/database", () => ({
    prisma: {
      departure: { findUnique: vi.fn().mockResolvedValue({ id: "dep-1", status: "SCHEDULED", vessel: { status: "ACTIVE" }, experience: { isActive: true } }) },
      partnerProfile: { findUnique: vi.fn().mockResolvedValue({ id: "partner-1", status: "ACTIVE" }) },
      guest: { findFirst: vi.fn().mockResolvedValue(null), create: vi.fn() },
      booking: {
        findFirst: vi.fn().mockResolvedValue(null),
        aggregate: vi.fn().mockResolvedValue({ _sum: { totalGuests: 0 } }),
        create: vi.fn(),
        update: vi.fn(),
      },
      bookingStatusHistory: { create: vi.fn() },
      bookingGuest: { createMany: vi.fn() },
      $transaction: vi.fn(async (fn: any) => fn({
        booking: { create: vi.fn().mockResolvedValue({ id: "b1", bookingReference: "BP-TEST", status: "PENDING" }) },
        bookingStatusHistory: { create: vi.fn() },
        bookingGuest: { createMany: vi.fn() },
      })),
    },
    bookingRepository: {
      findById: vi.fn(), findByDeparture: vi.fn(), findByPartner: vi.fn(), findByStatus: vi.fn(),
      create: vi.fn(), update: vi.fn(), findConflicting: vi.fn(),
    },
    departureRepository: {
      findById: vi.fn().mockResolvedValue({ id: "dep-1", status: "SCHEDULED", vessel: { status: "ACTIVE" }, experience: { isActive: true } }),
      findByIdWithCapacity: vi.fn(), decrementAvailableCapacity: vi.fn(), incrementAvailableCapacity: vi.fn(),
    },
    partnerRepository: { findById: vi.fn().mockResolvedValue({ id: "partner-1", status: "ACTIVE" }) },
  }));

  vi.doMock("../src/audit/audit.service", () => ({ auditService: { logRoleAssigned: vi.fn() } }));
  vi.doMock("../src/events", () => ({ eventBus: { emit: vi.fn(), on: vi.fn(), off: vi.fn() } }));
  vi.doMock("../src/policies", () => ({
    BookingPolicy: { assertCanBook: vi.fn(), isBookable: vi.fn().mockReturnValue(true), isVesselBookable: vi.fn().mockReturnValue(true), assertExperienceBookable: vi.fn() },
    DeparturePolicy: { assertModifiable: vi.fn() },
    PartnerPolicy: { assertCanBook: vi.fn() },
  }));
  vi.doMock("../src/guests/guest.service", () => ({ guestService: { resolveGuest: vi.fn() } }));
  vi.doMock("../src/bookings/booking-capacity.service", () => ({ bookingCapacityService: { atomicReserve: vi.fn(), atomicRelease: vi.fn() } }));
}

describe("partner booking workflow", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setupMocks();
  });

  it("creates a booking with PENDING status", async () => {
    const { bookingService } = await import("../src/bookings/booking.service");
    const result = await bookingService.createBooking({
      departureId: "dep-1", partnerId: "partner-1", totalGuests: 3, totalAmount: 3000, source: "PARTNER",
    });
    expect(result.bookingReference).toMatch(/^BP-/);
  });

  it("prevents duplicate bookings for same guest on same departure", async () => {
    const { bookingService } = await import("../src/bookings/booking.service");
    const db = require("@blue-pineapple/database") as any;
    db.bookingRepository.findConflicting.mockResolvedValue({ id: "existing" });
    await expect(
      bookingService.createBooking({ departureId: "dep-1", partnerId: "partner-1", totalGuests: 2, totalAmount: 2000, guestId: "g1", source: "PARTNER" })
    ).rejects.toThrow("Guest already has a booking for this departure");
  });

  it("prevents booking on non-SCHEDULED departure", async () => {
    const { bookingService } = await import("../src/bookings/booking.service");
    const db = require("@blue-pineapple/database") as any;
    db.prisma.departure.findUnique.mockResolvedValue({ id: "dep-1", status: "DEPARTED", vessel: { status: "ACTIVE" }, experience: { isActive: true } });
    await expect(
      bookingService.createBooking({ departureId: "dep-1", partnerId: "partner-1", totalGuests: 2, totalAmount: 2000, source: "PARTNER" })
    ).rejects.toThrow("Departure is not open for bookings");
  });

  it("counts online booked guests correctly via aggregate query", async () => {
    const { bookingService } = await import("../src/bookings/booking.service");
    const db = require("@blue-pineapple/database") as any;
    db.prisma.booking.aggregate.mockResolvedValue({ _sum: { totalGuests: 7 } });
    const count = await (bookingService as any).getOnlineBookedGuestCount("dep-1");
    expect(db.prisma.booking.aggregate).toHaveBeenCalledWith({
      where: { departureId: "dep-1", status: { not: "CANCELLED" }, source: { in: ["PARTNER"] } },
      _sum: { totalGuests: true },
    });
    expect(count).toBe(7);
  });
});
