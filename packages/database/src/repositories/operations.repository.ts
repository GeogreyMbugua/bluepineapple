import { prisma } from "../client";
import type {
  VoyageStatus,
  ReadinessCheckType,
  IncidentSeverity,
} from "@prisma/client";

export class VoyageRepository {
  async findById(id: string) {
    const voyage = await prisma.voyage.findUnique({
      where: { id },
    });
    if (!voyage) return null;

    const departure = await prisma.departure.findUnique({
      where: { id: voyage.departureId },
    });

    const vessel = await prisma.vessel.findUnique({ where: { id: voyage.vesselId } });
    const route = await prisma.route.findUnique({ where: { id: voyage.routeId } });
    const captain = voyage.captainId ? await prisma.user.findUnique({ where: { id: voyage.captainId } }) : null;

    const crewAssignments = await prisma.crewAssignment.findMany({
      where: { voyageId: voyage.id },
    });

    const manifest = await prisma.passengerManifest.findMany({
      where: { voyageId: voyage.id },
    });

    const incidents = await prisma.operationalIncident.findMany({ where: { voyageId: voyage.id } });
    const timeline = await prisma.voyageTimeline.findMany({
      where: { voyageId: voyage.id },
      orderBy: { eventAt: "asc" },
    });
    const readinessChecks = await prisma.vesselReadinessCheck.findMany({ where: { voyageId: voyage.id } });

    return {
      ...voyage,
      departure,
      vessel,
      route,
      captain,
      crewAssignments,
      manifest,
      incidents,
      timeline,
      readinessChecks,
    };
  }

  async findByDeparture(departureId: string) {
    return prisma.voyage.findUnique({
      where: { departureId },
    });
  }

  async findByVoyageNumber(voyageNumber: string) {
    return prisma.voyage.findUnique({
      where: { voyageNumber },
    });
  }

  async findByStatus(status: VoyageStatus, limit = 100) {
    return prisma.voyage.findMany({
      where: { status },
      orderBy: { scheduledDeparture: "asc" },
      take: limit,
    });
  }

  async findUpcoming(limit = 50) {
    return prisma.voyage.findMany({
      where: {
        status: { in: ["PLANNED", "READY", "BOARDING"] },
        scheduledDeparture: { gte: new Date() },
      },
      orderBy: { scheduledDeparture: "asc" },
      take: limit,
    });
  }

  async findActive() {
    return prisma.voyage.findMany({
      where: { status: { in: ["BOARDING", "DEPARTED"] } },
      orderBy: { scheduledDeparture: "asc" },
    });
  }

  async create(data: any): Promise<any> {
    return prisma.voyage.create({ data });
  }

  async update(id: string, data: any): Promise<any> {
    return prisma.voyage.update({ where: { id }, data });
  }

  async updateIfUnchanged(
    id: string,
    expectedUpdatedAt: Date,
    data: any
  ): Promise<any | null> {
    try {
      return prisma.voyage.update({
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

  async updateStatus(id: string, status: VoyageStatus, version: number): Promise<any> {
    return prisma.voyage.update({
      where: { id, version },
      data: { status, version: { increment: 1 } },
    });
  }
}

export class CrewMemberRepository {
  async findById(id: string) {
    return prisma.crewMember.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<any | null> {
    return prisma.crewMember.findUnique({
      where: { userId },
    });
  }

  async findActiveByRole(role: string, limit = 100): Promise<any[]> {
    return prisma.crewMember.findMany({
      where: { crewRole: role as any, isActive: true },
      orderBy: { lastName: "asc" },
      take: limit,
    });
  }

  async findAll(limit = 100): Promise<any[]> {
    return prisma.crewMember.findMany({
      orderBy: { lastName: "asc" },
      take: limit,
    });
  }

  async create(data: any): Promise<any> {
    return prisma.crewMember.create({ data });
  }

  async update(id: string, data: any): Promise<any> {
    return prisma.crewMember.update({ where: { id }, data });
  }

  async assignToVoyage(data: any): Promise<any> {
    return prisma.crewAssignment.create({ data });
  }

  async removeFromVoyage(voyageId: string, crewMemberId: string): Promise<any | null> {
    const assignment = await prisma.crewAssignment.findUnique({
      where: { voyageId_crewMemberId: { voyageId, crewMemberId } },
    });
    if (!assignment) return null;
    return prisma.crewAssignment.delete({
      where: { voyageId_crewMemberId: { voyageId, crewMemberId } },
    });
  }

  async getVoyageAssignments(voyageId: string): Promise<any[]> {
    return prisma.crewAssignment.findMany({
      where: { voyageId },
    });
  }
}

export class ManifestRepository {
  async findById(id: string) {
    const entry = await prisma.passengerManifest.findUnique({
      where: { id },
    });
    if (!entry) return null;

    const [voyage, guest, booking] = await Promise.all([
      prisma.voyage.findUnique({ where: { id: entry.voyageId } }),
      prisma.guest.findUnique({ where: { id: entry.guestId } }),
      prisma.booking.findUnique({ where: { id: entry.bookingId } }),
    ]);

    return { ...entry, voyage, guest, booking };
  }

  async findByVoyage(voyageId: string) {
    return prisma.passengerManifest.findMany({
      where: { voyageId },
    });
  }

  async findByBooking(bookingId: string) {
    return prisma.passengerManifest.findFirst({
      where: { bookingId },
    });
  }

  async findByBookingAndVoyage(bookingId: string, voyageId: string) {
    return prisma.passengerManifest.findUnique({
      where: { voyageId_bookingId: { voyageId, bookingId } },
    });
  }

  async create(data: any): Promise<any> {
    return prisma.passengerManifest.create({ data });
  }

  async update(id: string, data: any): Promise<any> {
    return prisma.passengerManifest.update({ where: { id }, data });
  }

  async updateIfUnchanged(
    id: string,
    expectedVersion: number,
    data: any
  ): Promise<any | null> {
    try {
      return prisma.passengerManifest.update({
        where: { id, version: expectedVersion },
        data: { ...data, version: { increment: 1 } },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Record to update not found")) {
        return null;
      }
      throw error;
    }
  }

  async getVoyageCounts(voyageId: string): Promise<{
    total: number;
    checkedIn: number;
    boarded: number;
    completed: number;
    noShow: number;
    cancelled: number;
  }> {
    const [total, checkedIn, boarded, completed, noShow, cancelled] = await Promise.all([
      prisma.passengerManifest.count({ where: { voyageId } }),
      prisma.passengerManifest.count({ where: { voyageId, status: "CHECKED_IN" } }),
      prisma.passengerManifest.count({ where: { voyageId, status: "BOARDED" } }),
      prisma.passengerManifest.count({ where: { voyageId, status: "COMPLETED" } }),
      prisma.passengerManifest.count({ where: { voyageId, status: "NO_SHOW" } }),
      prisma.passengerManifest.count({ where: { voyageId, status: "CANCELLED" } }),
    ]);
    return { total, checkedIn, boarded, completed, noShow, cancelled };
  }
}

export class CheckInRepository {
  async create(data: any): Promise<any> {
    return prisma.checkIn.create({ data });
  }

  async findById(id: string) {
    return prisma.checkIn.findUnique({
      where: { id },
    });
  }

  async findByManifest(manifestId: string): Promise<any | null> {
    return prisma.checkIn.findUnique({
      where: { manifestId },
    });
  }

  async findByVoyage(voyageId: string) {
    return prisma.checkIn.findMany({
      where: { voyageId },
    });
  }
}

export class BoardingRepository {
  async create(data: any): Promise<any> {
    return prisma.boarding.create({ data });
  }

  async findById(id: string) {
    return prisma.boarding.findUnique({
      where: { id },
    });
  }

  async findByManifest(manifestId: string): Promise<any | null> {
    return prisma.boarding.findUnique({
      where: { manifestId },
    });
  }

  async findByVoyage(voyageId: string) {
    return prisma.boarding.findMany({
      where: { voyageId },
    });
  }

  async delete(manifestId: string): Promise<any> {
    return prisma.boarding.delete({ where: { manifestId } });
  }
}

export class ReadinessCheckRepository {
  async findByVoyage(voyageId: string) {
    return prisma.vesselReadinessCheck.findMany({
      where: { voyageId },
    });
  }

  async upsert(voyageId: string, checkType: ReadinessCheckType, data: any): Promise<any> {
    return prisma.vesselReadinessCheck.upsert({
      where: { voyageId_checkType: { voyageId, checkType } },
      create: { voyageId, ...data },
      update: data,
    });
  }

  async allChecksPassed(voyageId: string): Promise<boolean> {
    const checks = await prisma.vesselReadinessCheck.findMany({
      where: { voyageId },
    });
    return checks.length > 0 && checks.every((c) => c.status === true);
  }
}

export class IncidentRepository {
  async create(data: any): Promise<any> {
    return prisma.operationalIncident.create({ data });
  }

  async findById(id: string) {
    return prisma.operationalIncident.findUnique({
      where: { id },
    });
  }

  async findByVoyage(voyageId: string) {
    return prisma.operationalIncident.findMany({
      where: { voyageId },
      orderBy: { recordedAt: "desc" },
    });
  }

  async update(id: string, data: any): Promise<any> {
    return prisma.operationalIncident.update({ where: { id }, data });
  }

  async findBySeverity(severity: IncidentSeverity, limit = 100) {
    return prisma.operationalIncident.findMany({
      where: { severity },
      orderBy: { recordedAt: "desc" },
      take: limit,
    });
  }
}

export class TimelineRepository {
  async create(voyageId: string, eventType: string, userId?: string, notes?: string, metadata?: any): Promise<void> {
    await prisma.voyageTimeline.create({
      data: {
        voyageId,
        eventType,
        userId: userId ?? null,
        notes: notes ?? null,
        metadata: metadata ?? null,
      },
    });
  }

  async findByVoyage(voyageId: string, limit = 100) {
    return prisma.voyageTimeline.findMany({
      where: { voyageId },
      orderBy: { eventAt: "desc" },
      take: limit,
    });
  }
}

export const voyageRepository = new VoyageRepository();
export const crewMemberRepository = new CrewMemberRepository();
export const manifestRepository = new ManifestRepository();
export const checkInRepository = new CheckInRepository();
export const boardingRepository = new BoardingRepository();
export const readinessCheckRepository = new ReadinessCheckRepository();
export const incidentRepository = new IncidentRepository();
export const timelineRepository = new TimelineRepository();