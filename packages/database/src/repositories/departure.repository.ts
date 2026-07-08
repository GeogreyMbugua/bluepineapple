import { prisma } from "../client";
import {
  Departure,
  DepartureStatus,
  BookingStatus,
} from "@prisma/client";

export class DepartureRepository {
  async findById(id: string) {
    return prisma.departure.findUnique({
      where: { id },
      include: {
        vessel: true,
        route: { include: { stops: { orderBy: { sequence: "asc" } } } },
        experience: true,
        bookings: {
          where: { status: { not: BookingStatus.CANCELLED } },
          select: { totalGuests: true },
        },
      },
    });
  }

  async findByIdWithCapacity(id: string) {
    return prisma.departure.findUnique({
      where: { id },
      select: {
        id: true,
        totalCapacity: true,
        bookedSeats: true,
        availableCapacity: true,
        status: true,
        departureDateTime: true,
        arrivalDateTime: true,
        specialInstructions: true,
        vesselId: true,
        routeId: true,
        experienceId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByStatus(status: DepartureStatus, limit = 100) {
    return prisma.departure.findMany({
      where: { status },
      orderBy: { departureDateTime: "desc" },
      take: limit,
    });
  }

  async findUpcoming(limit = 50) {
    return prisma.departure.findMany({
      where: {
        status: { in: [DepartureStatus.SCHEDULED, DepartureStatus.BOARDING] },
        departureDateTime: { gte: new Date() },
      },
      orderBy: { departureDateTime: "asc" },
      take: limit,
      include: {
        vessel: true,
        route: true,
        experience: true,
      },
    });
  }

  async create(data: any): Promise<Departure> {
    return prisma.departure.create({ data });
  }

  async update(id: string, data: any): Promise<Departure> {
    return prisma.departure.update({ where: { id }, data });
  }

  async updateIfUnchanged(id: string, expectedUpdatedAt: Date, data: any): Promise<Departure | null> {
    try {
      return prisma.departure.update({
        where: { id, updatedAt: expectedUpdatedAt },
        data,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Record to update not found")) {
        return null;
      }
      throw error;
    }
  }

  async cancel(id: string): Promise<Departure> {
    return prisma.departure.update({
      where: { id },
      data: { status: DepartureStatus.CANCELLED },
    });
  }

  async close(id: string): Promise<Departure> {
    return prisma.departure.update({
      where: { id },
      data: { status: DepartureStatus.COMPLETED },
    });
  }

  async hasBookings(departureId: string): Promise<boolean> {
    const count = await prisma.booking.count({
      where: {
        departureId,
        status: { not: BookingStatus.CANCELLED },
      },
    });
    return count > 0;
  }

  async decrementAvailableCapacity(id: string, amount: number): Promise<Departure> {
    return prisma.departure.update({
      where: { id },
      data: {
        availableCapacity: { decrement: amount },
        bookedSeats: { increment: amount },
      },
    });
  }

  async incrementAvailableCapacity(id: string, amount: number): Promise<Departure> {
    return prisma.departure.update({
      where: { id },
      data: {
        availableCapacity: { increment: amount },
        bookedSeats: { decrement: amount },
      },
    });
  }
}

export const departureRepository = new DepartureRepository();
