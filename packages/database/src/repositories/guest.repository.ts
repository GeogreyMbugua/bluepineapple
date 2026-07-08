import { prisma } from "../client";
import type {
  Guest,
  Prisma,
} from "@prisma/client";

export class GuestRepository {
  async findById(id: string): Promise<Guest | null> {
    return prisma.guest.findUnique({ where: { id } });
  }

  async findByIdentifier(identifier: string): Promise<Guest | null> {
    return prisma.guest.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
          { idNumber: identifier },
        ],
      },
    });
  }

  async incrementVisit(id: string): Promise<Guest> {
    return prisma.guest.update({
      where: { id },
      data: {
        totalVisits: { increment: 1 },
        lastVisitAt: new Date(),
      },
    });
  }

  async create(data: Prisma.GuestCreateInput): Promise<Guest> {
    return prisma.guest.create({ data });
  }

  async update(id: string, data: Prisma.GuestUpdateInput): Promise<Guest> {
    return prisma.guest.update({ where: { id }, data });
  }

  async list(limit = 100, offset = 0) {
    return prisma.guest.findMany({
      orderBy: { lastName: "asc" },
      take: limit,
      skip: offset,
    });
  }

  async search(query: string) {
    return prisma.guest.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 20,
    });
  }

  async findBookingHistory(guestId: string) {
    return prisma.booking.findMany({
      where: { guestId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        departure: {
          include: {
            experience: true,
            route: true,
            vessel: true,
          },
        },
        partner: true,
      },
    });
  }
}

export const guestRepository = new GuestRepository();
