import { prisma } from "../client";
export class VoyageRepository {
    async findById(id) {
        const voyage = await prisma.voyage.findUnique({
            where: { id },
        });
        if (!voyage)
            return null;
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
    async findByDeparture(departureId) {
        return prisma.voyage.findUnique({
            where: { departureId },
        });
    }
    async findByVoyageNumber(voyageNumber) {
        return prisma.voyage.findUnique({
            where: { voyageNumber },
        });
    }
    async findByStatus(status, limit = 100) {
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
    async create(data) {
        return prisma.voyage.create({ data });
    }
    async update(id, data) {
        return prisma.voyage.update({ where: { id }, data });
    }
    async updateIfUnchanged(id, expectedUpdatedAt, data) {
        try {
            return prisma.voyage.update({
                where: { id, updatedAt: expectedUpdatedAt },
                data,
            });
        }
        catch (error) {
            if (error instanceof Error && error.message.includes("Record to update not found")) {
                return null;
            }
            throw error;
        }
    }
    async updateStatus(id, status, version) {
        return prisma.voyage.update({
            where: { id, version },
            data: { status, version: { increment: 1 } },
        });
    }
}
export class CrewMemberRepository {
    async findById(id) {
        return prisma.crewMember.findUnique({
            where: { id },
        });
    }
    async findByUserId(userId) {
        return prisma.crewMember.findUnique({
            where: { userId },
        });
    }
    async findActiveByRole(role, limit = 100) {
        return prisma.crewMember.findMany({
            where: { crewRole: role, isActive: true },
            orderBy: { lastName: "asc" },
            take: limit,
        });
    }
    async findAll(limit = 100) {
        return prisma.crewMember.findMany({
            orderBy: { lastName: "asc" },
            take: limit,
        });
    }
    async create(data) {
        return prisma.crewMember.create({ data });
    }
    async update(id, data) {
        return prisma.crewMember.update({ where: { id }, data });
    }
    async assignToVoyage(data) {
        return prisma.crewAssignment.create({ data });
    }
    async removeFromVoyage(voyageId, crewMemberId) {
        const assignment = await prisma.crewAssignment.findUnique({
            where: { voyageId_crewMemberId: { voyageId, crewMemberId } },
        });
        if (!assignment)
            return null;
        return prisma.crewAssignment.delete({
            where: { voyageId_crewMemberId: { voyageId, crewMemberId } },
        });
    }
    async getVoyageAssignments(voyageId) {
        return prisma.crewAssignment.findMany({
            where: { voyageId },
        });
    }
}
export class ManifestRepository {
    async findById(id) {
        const entry = await prisma.passengerManifest.findUnique({
            where: { id },
        });
        if (!entry)
            return null;
        const [voyage, guest, booking] = await Promise.all([
            prisma.voyage.findUnique({ where: { id: entry.voyageId } }),
            prisma.guest.findUnique({ where: { id: entry.guestId } }),
            prisma.booking.findUnique({ where: { id: entry.bookingId } }),
        ]);
        return { ...entry, voyage, guest, booking };
    }
    async findByVoyage(voyageId) {
        return prisma.passengerManifest.findMany({
            where: { voyageId },
        });
    }
    async findByBooking(bookingId) {
        return prisma.passengerManifest.findFirst({
            where: { bookingId },
        });
    }
    async findByBookingAndVoyage(bookingId, voyageId) {
        return prisma.passengerManifest.findUnique({
            where: { voyageId_bookingId: { voyageId, bookingId } },
        });
    }
    async create(data) {
        return prisma.passengerManifest.create({ data });
    }
    async update(id, data) {
        return prisma.passengerManifest.update({ where: { id }, data });
    }
    async updateIfUnchanged(id, expectedVersion, data) {
        try {
            return prisma.passengerManifest.update({
                where: { id, version: expectedVersion },
                data: { ...data, version: { increment: 1 } },
            });
        }
        catch (error) {
            if (error instanceof Error && error.message.includes("Record to update not found")) {
                return null;
            }
            throw error;
        }
    }
    async getVoyageCounts(voyageId) {
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
    async create(data) {
        return prisma.checkIn.create({ data });
    }
    async findById(id) {
        return prisma.checkIn.findUnique({
            where: { id },
        });
    }
    async findByManifest(manifestId) {
        return prisma.checkIn.findUnique({
            where: { manifestId },
        });
    }
    async findByVoyage(voyageId) {
        return prisma.checkIn.findMany({
            where: { voyageId },
        });
    }
}
export class BoardingRepository {
    async create(data) {
        return prisma.boarding.create({ data });
    }
    async findById(id) {
        return prisma.boarding.findUnique({
            where: { id },
        });
    }
    async findByManifest(manifestId) {
        return prisma.boarding.findUnique({
            where: { manifestId },
        });
    }
    async findByVoyage(voyageId) {
        return prisma.boarding.findMany({
            where: { voyageId },
        });
    }
    async delete(manifestId) {
        return prisma.boarding.delete({ where: { manifestId } });
    }
}
export class ReadinessCheckRepository {
    async findByVoyage(voyageId) {
        return prisma.vesselReadinessCheck.findMany({
            where: { voyageId },
        });
    }
    async upsert(voyageId, checkType, data) {
        return prisma.vesselReadinessCheck.upsert({
            where: { voyageId_checkType: { voyageId, checkType } },
            create: { voyageId, ...data },
            update: data,
        });
    }
    async allChecksPassed(voyageId) {
        const checks = await prisma.vesselReadinessCheck.findMany({
            where: { voyageId },
        });
        return checks.length > 0 && checks.every((c) => c.status === true);
    }
}
export class IncidentRepository {
    async create(data) {
        return prisma.operationalIncident.create({ data });
    }
    async findById(id) {
        return prisma.operationalIncident.findUnique({
            where: { id },
        });
    }
    async findByVoyage(voyageId) {
        return prisma.operationalIncident.findMany({
            where: { voyageId },
            orderBy: { recordedAt: "desc" },
        });
    }
    async update(id, data) {
        return prisma.operationalIncident.update({ where: { id }, data });
    }
    async findBySeverity(severity, limit = 100) {
        return prisma.operationalIncident.findMany({
            where: { severity },
            orderBy: { recordedAt: "desc" },
            take: limit,
        });
    }
}
export class TimelineRepository {
    async create(voyageId, eventType, userId, notes, metadata) {
        await prisma.voyageTimeline.create({
            data: { voyageId, eventType, userId, notes, metadata },
        });
    }
    async findByVoyage(voyageId, limit = 100) {
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
