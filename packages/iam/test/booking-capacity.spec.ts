import { describe, expect, it, vi } from "vitest";
import { BookingCapacityService } from "../src/bookings/booking-capacity.service";

describe("BookingCapacityService", () => {
  it("reserves online seats against both physical and online caps", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const tx = {
      departure: {
        findUnique: vi.fn().mockResolvedValue({ onlineCapacity: 20 }),
        updateMany,
      },
    } as any;

    await new BookingCapacityService().atomicReserveOnline(tx, "departure-1", 3);

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: "departure-1",
        availableCapacity: { gte: 3 },
        onlineBookedSeats: { lte: 17 },
      },
      data: {
        bookedSeats: { increment: 3 },
        availableCapacity: { decrement: 3 },
        onlineBookedSeats: { increment: 3 },
      },
    });
  });

  it("rejects an online reservation when the atomic update cannot claim seats", async () => {
    const tx = {
      departure: {
        findUnique: vi.fn().mockResolvedValue({ onlineCapacity: 20 }),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
    } as any;

    await expect(
      new BookingCapacityService().atomicReserveOnline(tx, "departure-1", 1),
    ).rejects.toThrow("Insufficient online capacity");
  });

  it("releases online and physical counters together", async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const tx = { departure: { updateMany } } as any;

    await new BookingCapacityService().atomicRelease(tx, "departure-1", 2, true);

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: "departure-1",
        bookedSeats: { gte: 2 },
        onlineBookedSeats: { gte: 2 },
      },
      data: {
        bookedSeats: { decrement: 2 },
        availableCapacity: { increment: 2 },
        onlineBookedSeats: { decrement: 2 },
      },
    });
  });
});
