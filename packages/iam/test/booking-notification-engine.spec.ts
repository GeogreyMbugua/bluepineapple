import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@blue-pineapple/database", () => ({
  prisma: {
    partnerProfile: {
      findFirst: vi.fn(),
    },
  },
  bookingRepository: {
    findById: vi.fn(),
  },
  userRepository: {
    findAdmins: vi.fn(),
  },
}));

vi.mock("../src/adapters", () => ({
  notificationService: {
    send: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../src/events", () => ({
  eventBus: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

import { bookingRepository, prisma, userRepository } from "@blue-pineapple/database";
import { notificationService } from "../src/adapters";
import { eventBus } from "../src/events";
import { BookingNotificationEngine } from "../src/notifications/booking-notification-engine";

describe("BookingNotificationEngine partner email fallback", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("sends confirmation to guest email when guest exists", async () => {
    (bookingRepository.findById as any).mockResolvedValue({
      id: "booking-1",
      bookingReference: "BP-TEST",
      totalGuests: 2,
      totalAmount: 5000,
      guest: {
        firstName: "John",
        lastName: "Doe",
        email: "guest@example.com",
      },
      departure: {
        departureDateTime: new Date("2025-01-15T10:00:00Z"),
        experience: { name: "Sunset Cruise" },
        route: { name: "Mombasa Route" },
      },
    });

    const engine = new BookingNotificationEngine();
    engine.start();

    const registeredHandler = (eventBus.on as any).mock.calls[0][1];
    await registeredHandler({
      bookingId: "booking-1",
      bookingReference: "BP-TEST",
    });

    expect(notificationService.send).toHaveBeenCalledTimes(1);
    expect(notificationService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "guest@example.com",
        subject: "Booking Confirmed — BP-TEST",
        purpose: "BOOKING_CONFIRMATION",
      })
    );
  });

  it("falls back to partner email when guest email is absent", async () => {
    (bookingRepository.findById as any).mockResolvedValue({
      id: "booking-2",
      bookingReference: "BP-PARTNER",
      totalGuests: 3,
      totalAmount: 7500,
      guest: null,
      partnerId: "partner-1",
      departure: {
        departureDateTime: new Date("2025-01-16T14:00:00Z"),
        experience: { name: "Sunset Cruise" },
        route: { name: "Mombasa Route" },
      },
    });

    (prisma.partnerProfile.findFirst as any).mockResolvedValue({
      user: { email: "partner@example.com" },
    });

    const engine = new BookingNotificationEngine();
    engine.start();

    const registeredHandler = (eventBus.on as any).mock.calls[0][1];
    await registeredHandler({
      bookingId: "booking-2",
      bookingReference: "BP-PARTNER",
    });

    expect(notificationService.send).toHaveBeenCalledTimes(1);
    expect(notificationService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "partner@example.com",
        subject: "Booking Confirmed — BP-PARTNER",
        purpose: "BOOKING_CONFIRMATION",
      })
    );
  });

  it("does not send email when neither guest nor partner email is available", async () => {
    (bookingRepository.findById as any).mockResolvedValue({
      id: "booking-3",
      bookingReference: "BP-NOEMAIL",
      totalGuests: 1,
      totalAmount: 2500,
      guest: null,
      partnerId: "partner-1",
      departure: {
        departureDateTime: new Date("2025-01-17T09:00:00Z"),
        experience: { name: "Morning Trip" },
        route: { name: "Nyali Route" },
      },
    });

    (prisma.partnerProfile.findFirst as any).mockResolvedValue({
      user: { email: null },
    });

    const engine = new BookingNotificationEngine();
    engine.start();

    const registeredHandler = (eventBus.on as any).mock.calls[0][1];
    await registeredHandler({
      bookingId: "booking-3",
      bookingReference: "BP-NOEMAIL",
    });

    expect(notificationService.send).not.toHaveBeenCalled();
  });

  it("does not send email when booking is not found", async () => {
    (bookingRepository.findById as any).mockResolvedValue(null);

    const engine = new BookingNotificationEngine();
    engine.start();

    const registeredHandler = (eventBus.on as any).mock.calls[0][1];
    await registeredHandler({
      bookingId: "booking-missing",
      bookingReference: "BP-MISSING",
    });

    expect(notificationService.send).not.toHaveBeenCalled();
  });

  describe("admin booking created notification", () => {
    it("sends admin notification when booking is created and admins exist", async () => {
      (bookingRepository.findById as any).mockResolvedValue({
        id: "booking-new",
        bookingReference: "BP-NEW",
        totalGuests: 4,
        totalAmount: 10000,
        guest: {
          firstName: "Alice",
          lastName: "Smith",
        },
        partnerId: "partner-1",
        departure: {
          departureDateTime: new Date("2025-01-20T08:00:00Z"),
          experience: { name: "Morning Cruise" },
          vessel: { name: "MV Ocean" },
          route: { name: "Nyali Route" },
        },
      });

      (userRepository.findAdmins as any).mockResolvedValue([
        { id: "admin-1", email: "admin1@example.com", firstName: "Admin", lastName: "One" },
        { id: "admin-2", email: "admin2@example.com", firstName: "Admin", lastName: "Two" },
      ]);

      const engine = new BookingNotificationEngine();
      engine.start();

      const createdHandler = (eventBus.on as any).mock.calls[1][1];
      await createdHandler({
        bookingId: "booking-new",
        bookingReference: "BP-NEW",
        departureId: "dep-1",
        partnerId: "partner-1",
        guestId: "guest-1",
        totalGuests: 4,
        status: "PENDING",
      });

      expect(notificationService.send).toHaveBeenCalledTimes(2);
      expect(notificationService.send).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          to: "admin1@example.com",
          subject: "New Booking Created — BP-NEW",
          purpose: "ADMIN_BOOKING_CREATED",
        })
      );
      expect(notificationService.send).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          to: "admin2@example.com",
          subject: "New Booking Created — BP-NEW",
          purpose: "ADMIN_BOOKING_CREATED",
        })
      );
    });

    it("does not send admin notification when no admins exist", async () => {
      (bookingRepository.findById as any).mockResolvedValue({
        id: "booking-new",
        bookingReference: "BP-NEW",
        totalGuests: 2,
        totalAmount: 5000,
        guest: null,
        partnerId: "partner-1",
        departure: {
          departureDateTime: new Date("2025-01-20T08:00:00Z"),
          experience: { name: "Morning Cruise" },
          route: { name: "Nyali Route" },
        },
      });

      (userRepository.findAdmins as any).mockResolvedValue([]);

      const engine = new BookingNotificationEngine();
      engine.start();

      const createdHandler = (eventBus.on as any).mock.calls[1][1];
      await createdHandler({
        bookingId: "booking-new",
        bookingReference: "BP-NEW",
        departureId: "dep-1",
        partnerId: "partner-1",
        totalGuests: 2,
        status: "PENDING",
      });

      expect(notificationService.send).not.toHaveBeenCalled();
    });

    it("skips admins without email addresses", async () => {
      (bookingRepository.findById as any).mockResolvedValue({
        id: "booking-new",
        bookingReference: "BP-NEW",
        totalGuests: 2,
        totalAmount: 5000,
        guest: null,
        partnerId: "partner-1",
        departure: {
          departureDateTime: new Date("2025-01-20T08:00:00Z"),
          experience: { name: "Morning Cruise" },
          route: { name: "Nyali Route" },
        },
      });

      (userRepository.findAdmins as any).mockResolvedValue([
        { id: "admin-1", email: null, firstName: "Admin", lastName: "One" },
        { id: "admin-2", email: "admin2@example.com", firstName: "Admin", lastName: "Two" },
      ]);

      const engine = new BookingNotificationEngine();
      engine.start();

      const createdHandler = (eventBus.on as any).mock.calls[1][1];
      await createdHandler({
        bookingId: "booking-new",
        bookingReference: "BP-NEW",
        departureId: "dep-1",
        partnerId: "partner-1",
        totalGuests: 2,
        status: "PENDING",
      });

      expect(notificationService.send).toHaveBeenCalledTimes(1);
      expect(notificationService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "admin2@example.com",
          subject: "New Booking Created — BP-NEW",
          purpose: "ADMIN_BOOKING_CREATED",
        })
      );
    });
  });
});
