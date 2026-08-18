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

describe("minimal test", () => {
  it("loads engine without error", async () => {
    const { BookingNotificationEngine } = await import("../src/notifications/booking-notification-engine");
    expect(BookingNotificationEngine).toBeDefined();
  });
});
