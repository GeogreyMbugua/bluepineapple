import { describe, expect, it } from "vitest";
import { renderAdminBookingCreatedEmail } from "../src/notifications/templates/booking-created-admin.template";

describe("renderAdminBookingCreatedEmail", () => {
  it("includes booking source, composition, journey, and both capacity limits", () => {
    const html = renderAdminBookingCreatedEmail({
      bookingReference: "BP-TEST",
      totalGuests: 4,
      totalAmount: "9600",
      source: "DIRECT",
      pricingMode: "PUBLIC",
      adults: 4,
      children: 0,
      infants: 0,
      discountRate: 0.2,
      discountAmount: 2400,
      origin: "Mtwapa Beach",
      destination: "Fort Jesus",
      departure: {
        departureDateTime: new Date("2026-08-29T06:30:00Z"),
        vessel: { name: "Setting Sons" },
        totalCapacity: 35,
        availableCapacity: 31,
        onlineCapacity: 20,
        onlineBookedSeats: 4,
      },
    });

    expect(html).toContain("DIRECT / PUBLIC");
    expect(html).toContain("Mtwapa Beach → Fort Jesus");
    expect(html).toContain("4 adult(s), 0 child(ren), 0 under 5");
    expect(html).toContain("Online: 16/20 remaining; vessel: 31/35 remaining.");
  });
});
