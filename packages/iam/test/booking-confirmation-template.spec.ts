import { describe, it, expect } from "vitest";
import { renderBookingConfirmationEmail } from "../src/notifications/templates/booking-confirmation.template";

describe("renderBookingConfirmationEmail", () => {
  it("renders guest greeting when recipientType is GUEST", () => {
    const html = renderBookingConfirmationEmail({
      bookingReference: "BP-TEST",
      totalGuests: 2,
      totalAmount: "5000",
      guest: { firstName: "John", lastName: "Doe" },
      recipientType: "GUEST",
    });
    expect(html).toContain("Hi John Doe, your booking has been confirmed.");
  });

  it("renders partner greeting when recipientType is PARTNER", () => {
    const html = renderBookingConfirmationEmail({
      bookingReference: "BP-TEST",
      totalGuests: 2,
      totalAmount: "5000",
      recipientType: "PARTNER",
    });
    expect(html).toContain("A booking has been confirmed on your behalf.");
  });

  it("defaults to guest greeting when recipientType is omitted", () => {
    const html = renderBookingConfirmationEmail({
      bookingReference: "BP-TEST",
      totalGuests: 2,
      totalAmount: "5000",
      guest: { firstName: "John", lastName: "Doe" },
    });
    expect(html).toContain("Hi John Doe, your booking has been confirmed.");
  });

  it("uses the admin-confirmed departure time", () => {
    const html = renderBookingConfirmationEmail({
      bookingReference: "BP-TEST",
      totalGuests: 1,
      totalAmount: "3000",
      confirmedDepartureTime: new Date("2026-09-15T11:15:00.000Z"),
      departure: {
        departureDateTime: new Date("2026-09-15T06:30:00.000Z"),
      },
    });

    expect(html).toContain("14:15");
    expect(html).not.toContain("09:30");
  });
});
