import { prisma } from "../client";
import {
  Booking,
  BookingStatus,
  Prisma,
} from "@prisma/client";

export class BookingRepository {
  async findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        guest: true,
        guests: true,
        statusHistory: { orderBy: { changedAt: "desc" } },
        rewards: true,
        departure: true,
        partner: true,
        pickupStop: true,
      },
    });
  }

  async findByReference(reference: string) {
    return prisma.booking.findUnique({
      where: { bookingReference: reference },
      include: {
        guest: true,
        guests: true,
        statusHistory: true,
        departure: { include: { experience: true, route: true, vessel: true } },
        partner: true,
      },
    });
  }

  async findByDeparture(departureId: string) {
    return prisma.booking.findMany({
      where: { departureId, status: { not: BookingStatus.CANCELLED } },
      orderBy: { createdAt: "asc" },
      include: { guest: true, partner: true },
    });
  }

  async findByPartner(partnerId: string, limit = 50, offset = 0) {
    return prisma.booking.findMany({
      where: { partnerId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        guest: true,
        departure: { include: { experience: true, route: true } },
      },
    });
  }

  async findByGuest(guestId: string) {
    return prisma.booking.findMany({
      where: { guestId },
      orderBy: { createdAt: "desc" },
      include: {
        departure: { include: { experience: true, route: true, vessel: true } },
        partner: true,
      },
    });
  }

  async findByStatus(status: BookingStatus, limit = 100) {
    return prisma.booking.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        guest: true,
        departure: { include: { experience: true, route: true } },
        partner: true,
      },
    });
  }

  async create(data: Prisma.BookingCreateInput): Promise<Booking> {
    return prisma.booking.create({ data });
  }

  async update(
    id: string,
    data: Prisma.BookingUpdateInput
  ): Promise<Booking> {
    return prisma.booking.update({ where: { id }, data });
  }

  async updateIfUnchanged(
    id: string,
    expectedUpdatedAt: Date,
    data: Prisma.BookingUpdateInput
  ): Promise<Booking | null> {
    try {
      return prisma.booking.update({
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

  async findConflicting(
    departureId: string,
    guestId: string
  ): Promise<Booking | null> {
    return prisma.booking.findFirst({
      where: {
        departureId,
        guestId,
        status: { not: BookingStatus.CANCELLED },
      },
    });
  }
}

export const bookingRepository = new BookingRepository();
