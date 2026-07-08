import { prisma } from "@blue-pineapple/database";
import {
  voyageRepository,
  crewMemberRepository,
  manifestRepository,
  checkInRepository,
  boardingRepository,
  readinessCheckRepository,
  incidentRepository,
  timelineRepository,
  departureRepository,
  vesselRepository,
  bookingRepository,
} from "@blue-pineapple/database";
import { auditService } from "../audit/audit.service";
import { eventBus } from "../events";
import { OperationsPolicy, ManifestPolicy } from "../policies/operations.policy";
import type {
  CreateVoyageInput,
  VoyageSearchInput,
  AssignCaptainInput,
  AssignCrewInput,
  RemoveCrewInput,
  CancelVoyageInput,
  CreateCrewMemberInput,
  UpdateCrewMemberInput,
  ReadinessCheckInput,
  CreateIncidentInput,
  UpdateIncidentInput,
  CheckInInput,
  BoardingInput,
  UndoBoardingInput,
  CompleteVoyageInput,
} from "./operations.validators";

export class VoyageService {
  private generateVoyageNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `VY-${timestamp}-${random}`;
  }

  async createVoyage(data: CreateVoyageInput, actorId?: string): Promise<{ id: string; voyageNumber: string }> {
    const departure = await departureRepository.findById(data.departureId);
    if (!departure) {
      throw new Error("Departure not found");
    }

    const existing = await voyageRepository.findByDeparture(data.departureId);
    if (existing) {
      throw new Error("Voyage already exists for this departure");
    }

    const vessel = await vesselRepository.findById(data.vesselId);
    if (!vessel || vessel.status !== "ACTIVE") {
      throw new Error("Active vessel is required");
    }

    const voyageNumber = this.generateVoyageNumber();

    const voyage = await voyageRepository.create({
      voyageNumber,
      departureId: data.departureId,
      vesselId: data.vesselId,
      routeId: data.routeId,
      captainId: data.captainId,
      operationalNotes: data.operationalNotes,
      scheduledDeparture: departure.departureDateTime,
      scheduledArrival: departure.arrivalDateTime,
      status: "PLANNED",
    });

    auditService.logRoleAssigned(actorId ?? "system", voyage.id, "VOYAGE_CREATED");

    eventBus.emit("voyage.created", {
      voyageId: voyage.id,
      voyageNumber,
      departureId: data.departureId,
      vesselId: data.vesselId,
    });

    return { id: voyage.id, voyageNumber };
  }

  async getVoyage(id: string) {
    return voyageRepository.findById(id);
  }

  async getVoyageByDeparture(departureId: string) {
    return voyageRepository.findByDeparture(departureId);
  }

  async searchVoyages(input: VoyageSearchInput) {
    return voyageRepository.findByStatus(input.status ?? "PLANNED", input.limit);
  }

  async getUpcomingVoyages(limit = 50) {
    return voyageRepository.findUpcoming(limit);
  }

  async getActiveVoyages() {
    return (voyageRepository as any).findActive();
  }

  async assignCaptain(voyageId: string, data: AssignCaptainInput, actorId?: string): Promise<void> {
    const voyage = await voyageRepository.findById(voyageId);
    if (!voyage) {
      throw new Error("Voyage not found");
    }

    OperationsPolicy.assertModifiable(voyage.status);

    await voyageRepository.update(voyageId, { captainId: data.captainId });

    auditService.logRoleAssigned(actorId ?? "system", voyageId, "CAPTAIN_ASSIGNED");

    eventBus.emit("voyage.captain.assigned", {
      voyageId,
      voyageNumber: voyage.voyageNumber,
      captainId: data.captainId,
    });
  }

  async assignCrew(voyageId: string, data: AssignCrewInput, actorId?: string): Promise<void> {
    const voyage = await voyageRepository.findById(voyageId);
    if (!voyage) {
      throw new Error("Voyage not found");
    }

    OperationsPolicy.assertModifiable(voyage.status);

    const crewMember = await crewMemberRepository.findById(data.crewMemberId);
    if (!crewMember || !crewMember.isActive) {
      throw new Error("Active crew member not found");
    }

    await crewMemberRepository.assignToVoyage({
      voyage: { connect: { id: voyageId } },
      crewMember: { connect: { id: data.crewMemberId } },
      crewRole: data.crewRole,
      assignedBy: actorId ?? "system",
    });

    auditService.logRoleAssigned(actorId ?? "system", voyageId, "CREW_ASSIGNED");

    eventBus.emit("voyage.crew.assigned", {
      voyageId,
      voyageNumber: voyage.voyageNumber,
      crewMemberId: data.crewMemberId,
      crewRole: data.crewRole,
    });
  }

  async removeCrew(voyageId: string, data: RemoveCrewInput, actorId?: string): Promise<void> {
    const voyage = await voyageRepository.findById(voyageId);
    if (!voyage) {
      throw new Error("Voyage not found");
    }

    OperationsPolicy.assertModifiable(voyage.status);

    const removed = await crewMemberRepository.removeFromVoyage(voyageId, data.crewMemberId);
    if (!removed) {
      throw new Error("Crew member not assigned to this voyage");
    }

    auditService.logRoleAssigned(actorId ?? "system", voyageId, "CREW_REMOVED");

    eventBus.emit("voyage.crew.removed", {
      voyageId,
      voyageNumber: voyage.voyageNumber,
      crewMemberId: data.crewMemberId,
    });
  }

  async generateManifest(voyageId: string, actorId?: string): Promise<number> {
    const voyage = await voyageRepository.findById(voyageId);
    if (!voyage) {
      throw new Error("Voyage not found");
    }

    OperationsPolicy.canGenerateManifest(voyage.status);

    const bookings = await bookingRepository.findByDeparture(voyage.departureId);
    if (!bookings || bookings.length === 0) {
      throw new Error("No confirmed bookings found for this voyage");
    }

    const manifestEntries = await prisma.$transaction(async (tx) => {
      const entries = [];
      for (const booking of bookings) {
        if (booking.guestId) {
          const existing = await manifestRepository.findByBookingAndVoyage(booking.id, voyageId);
          if (!existing) {
            const entry = await tx.passengerManifest.create({
              data: {
                voyageId,
                bookingId: booking.id,
                guestId: booking.guestId,
                status: "RESERVED",
              },
            });
            entries.push(entry);
          }
        }
      }
      return entries;
    });

    auditService.logRoleAssigned(actorId ?? "system", voyageId, "MANIFEST_GENERATED");

    eventBus.emit("voyage.manifest.locked", {
      voyageId,
      voyageNumber: voyage.voyageNumber,
      passengerCount: manifestEntries.length,
    });

    return manifestEntries.length;
  }

  async startBoarding(voyageId: string, actorId?: string): Promise<void> {
    const voyage = await voyageRepository.findById(voyageId);
    if (!voyage) {
      throw new Error("Voyage not found");
    }

    OperationsPolicy.assertTransition(voyage.status, "BOARDING");

    await OperationsPolicy.validateVesselReadiness(voyageId, readinessCheckRepository);

    await voyageRepository.updateStatus(voyageId, "BOARDING", voyage.version);

    await timelineRepository.create(voyageId, "BOARDING_STARTED", actorId);

    auditService.logRoleAssigned(actorId ?? "system", voyageId, "VOYAGE_BOARDING_STARTED");
  }

  async departVoyage(voyageId: string, actorId?: string): Promise<void> {
    const voyage = await voyageRepository.findById(voyageId);
    if (!voyage) {
      throw new Error("Voyage not found");
    }

    OperationsPolicy.assertTransition(voyage.status, "DEPARTED");

    await prisma.$transaction(async (tx) => {
      await tx.voyage.update({
        where: { id: voyageId, version: voyage.version },
        data: { status: "DEPARTED", actualDeparture: new Date(), version: { increment: 1 } },
      });

      await tx.passengerManifest.updateMany({
        where: { voyageId, status: "BOARDED" },
        data: { status: "ON_VOYAGE" },
      });
    });

    await timelineRepository.create(voyageId, "DEPARTED", actorId);

    auditService.logRoleAssigned(actorId ?? "system", voyageId, "VOYAGE_DEPARTED");

    eventBus.emit("voyage.departed", {
      voyageId,
      voyageNumber: voyage.voyageNumber,
    });
  }

  async arriveVoyage(voyageId: string, actorId?: string): Promise<void> {
    const voyage = await voyageRepository.findById(voyageId);
    if (!voyage) {
      throw new Error("Voyage not found");
    }

    OperationsPolicy.assertTransition(voyage.status, "ARRIVED");

    await voyageRepository.update(voyageId, { status: "ARRIVED", actualArrival: new Date() });

    await timelineRepository.create(voyageId, "ARRIVED", actorId);

    auditService.logRoleAssigned(actorId ?? "system", voyageId, "VOYAGE_ARRIVED");

    eventBus.emit("voyage.arrived", {
      voyageId,
      voyageNumber: voyage.voyageNumber,
    });
  }

  async completeVoyage(voyageId: string, data: CompleteVoyageInput, actorId?: string): Promise<void> {
    const voyage = await voyageRepository.findById(voyageId);
    if (!voyage) {
      throw new Error("Voyage not found");
    }

    OperationsPolicy.assertTransition(voyage.status, "COMPLETED");

    await prisma.$transaction(async (tx) => {
      if (data.actualDeparture) {
        await tx.voyage.update({
          where: { id: voyageId },
          data: { actualDeparture: data.actualDeparture },
        });
      }
      if (data.actualArrival) {
        await tx.voyage.update({
          where: { id: voyageId },
          data: { actualArrival: data.actualArrival },
        });
      }
      await tx.voyage.update({
        where: { id: voyageId },
        data: { status: "COMPLETED", completionSummary: data.completionSummary ?? null },
      });
    });

    await timelineRepository.create(voyageId, "COMPLETED", actorId);

    auditService.logRoleAssigned(actorId ?? "system", voyageId, "VOYAGE_COMPLETED");

    eventBus.emit("voyage.completed", {
      voyageId,
      voyageNumber: voyage.voyageNumber,
      ...(data.completionSummary ? { completionSummary: data.completionSummary } : {}),
    });
  }

  async cancelVoyage(voyageId: string, data: CancelVoyageInput, actorId?: string): Promise<void> {
    const voyage = await voyageRepository.findById(voyageId);
    if (!voyage) {
      throw new Error("Voyage not found");
    }

    OperationsPolicy.canCancel(voyage.status);
    OperationsPolicy.assertTransition(voyage.status, "CANCELLED");

    await prisma.$transaction(async (tx) => {
      await tx.voyage.update({
        where: { id: voyageId },
        data: { status: "CANCELLED", cancellationReason: data.reason ?? null },
      });

      await tx.passengerManifest.updateMany({
        where: { voyageId },
        data: { status: "CANCELLED" },
      });
    });

    await timelineRepository.create(voyageId, "CANCELLED", actorId, data.reason ?? undefined);

    auditService.logRoleAssigned(actorId ?? "system", voyageId, "VOYAGE_CANCELLED");

    eventBus.emit("voyage.cancelled", {
      voyageId,
      voyageNumber: voyage.voyageNumber,
      ...(data.reason ? { reason: data.reason } : {}),
    });
  }

  async abortVoyage(voyageId: string, actorId?: string): Promise<void> {
    const voyage = await voyageRepository.findById(voyageId);
    if (!voyage) {
      throw new Error("Voyage not found");
    }

    OperationsPolicy.assertTransition(voyage.status, "ABORTED");

    await voyageRepository.update(voyageId, { status: "ABORTED" });

    await timelineRepository.create(voyageId, "ABORTED", actorId);

    auditService.logRoleAssigned(actorId ?? "system", voyageId, "VOYAGE_ABORTED");
  }
}

export class CrewService {
  async createCrewMember(data: CreateCrewMemberInput, actorId?: string): Promise<{ id: string }> {
    if (data.userId) {
      const existing = await crewMemberRepository.findByUserId(data.userId);
      if (existing) {
        throw new Error("User is already a crew member");
      }
    }

    const crewMember = await crewMemberRepository.create({
      userId: data.userId,
      firstName: data.firstName,
      lastName: data.lastName,
      crewRole: data.crewRole,
      licenseNumber: data.licenseNumber,
      certification: data.certification,
      isActive: true,
      notes: data.notes,
    });

    auditService.logRoleAssigned(actorId ?? "system", crewMember.id, "CREW_MEMBER_CREATED");

    return { id: crewMember.id };
  }

  async updateCrewMember(id: string, data: UpdateCrewMemberInput, actorId?: string): Promise<void> {
    const existing = await crewMemberRepository.findById(id);
    if (!existing) {
      throw new Error("Crew member not found");
    }

    await crewMemberRepository.update(id, data);

    auditService.logRoleAssigned(actorId ?? "system", id, "CREW_MEMBER_UPDATED");
  }

  async getCrewMember(id: string) {
    return crewMemberRepository.findById(id);
  }

  async listCrewMembers(limit = 100) {
    return crewMemberRepository.findAll(limit);
  }

  async listActiveByRole(role: string, limit = 100) {
    return crewMemberRepository.findActiveByRole(role, limit);
  }
}

export class ManifestService {
  async checkIn(manifestId: string, data: CheckInInput, actorId?: string): Promise<void> {
    const manifest = await manifestRepository.findById(manifestId);
    if (!manifest) {
      throw new Error("Manifest entry not found");
    }

    ManifestPolicy.assertTransition(manifest.status, "CHECKED_IN");

    const checkIn = await checkInRepository.create({
      manifestId,
      voyageId: manifest.voyageId ?? "",
      checkedById: actorId ?? "system",
      boardingGroup: data.boardingGroup,
      notes: data.notes,
    });

    await manifestRepository.update(manifestId, { status: "CHECKED_IN", checkInId: checkIn.id });

    auditService.logRoleAssigned(actorId ?? "system", manifestId, "PASSENGER_CHECKED_IN");

    eventBus.emit("voyage.passenger.checkedIn", {
      manifestId,
      voyageId: manifest.voyageId ?? "",
      bookingId: manifest.bookingId ?? "",
      guestId: manifest.guestId ?? "",
    });
  }

  async board(manifestId: string, data: BoardingInput, actorId?: string): Promise<void> {
    const manifest = await manifestRepository.findById(manifestId);
    if (!manifest) {
      throw new Error("Manifest entry not found");
    }

    ManifestPolicy.assertTransition(manifest.status, "BOARDED");

    const boarding = await boardingRepository.create({
      manifestId,
      voyageId: manifest.voyageId ?? "",
      boardedById: actorId ?? "system",
      status: data.status,
      notes: data.notes,
    });

    await manifestRepository.update(manifestId, { status: "BOARDED", boardingId: boarding.id });

    auditService.logRoleAssigned(actorId ?? "system", manifestId, "PASSENGER_BOARDED");

    eventBus.emit("voyage.passenger.boarded", {
      manifestId,
      voyageId: manifest.voyageId ?? "",
      bookingId: manifest.bookingId ?? "",
      guestId: manifest.guestId ?? "",
    });
  }

  async undoBoarding(manifestId: string, _data: UndoBoardingInput, actorId?: string): Promise<void> {
    const manifest = await manifestRepository.findById(manifestId);
    if (!manifest) {
      throw new Error("Manifest entry not found");
    }

    const boarding = await boardingRepository.findByManifest(manifestId);
    if (!boarding) {
      throw new Error("No boarding record found");
    }

    await prisma.$transaction(async (tx) => {
      await tx.boarding.delete({ where: { manifestId } });
      await tx.passengerManifest.update({
        where: { id: manifestId },
        data: { status: "CHECKED_IN", boardingId: null },
      });
    });

    auditService.logRoleAssigned(actorId ?? "system", manifestId, "BOARDING_UNDONE");

    eventBus.emit("voyage.boarding.undone", {
      manifestId,
      voyageId: manifest.voyageId ?? "",
      bookingId: manifest.bookingId ?? "",
    });
  }

  async getManifestEntry(id: string) {
    return manifestRepository.findById(id);
  }

  async getVoyageManifest(voyageId: string) {
    return manifestRepository.findByVoyage(voyageId);
  }

  async getVoyageCounts(voyageId: string) {
    return manifestRepository.getVoyageCounts(voyageId);
  }
}

export class ReadinessService {
  async verifyCheck(voyageId: string, data: ReadinessCheckInput, actorId?: string): Promise<void> {
    const voyage = await voyageRepository.findById(voyageId);
    if (!voyage) {
      throw new Error("Voyage not found");
    }

    await readinessCheckRepository.upsert(voyageId, data.checkType, {
      status: data.status,
      verifiedBy: actorId ?? "system",
      verifiedAt: new Date(),
      notes: data.notes,
    });

    auditService.logRoleAssigned(actorId ?? "system", voyageId, `READINESS_${data.checkType}_VERIFIED`);

    eventBus.emit("voyage.readiness.verified", {
      voyageId,
      checkType: data.checkType,
      status: data.status,
    } as any);
  }

  async getVoyageReadiness(voyageId: string) {
    return readinessCheckRepository.findByVoyage(voyageId);
  }

  async isVesselReady(voyageId: string): Promise<boolean> {
    return readinessCheckRepository.allChecksPassed(voyageId);
  }
}

export class IncidentService {
  async reportIncident(data: CreateIncidentInput, actorId?: string): Promise<{ id: string }> {
    const incident = await incidentRepository.create({
      voyageId: data.voyageId,
      type: data.type,
      severity: data.severity ?? "MEDIUM",
      description: data.description,
      recordedBy: actorId ?? "system",
      metadata: data.metadata,
    });

    auditService.logRoleAssigned(actorId ?? "system", incident.id, "INCIDENT_REPORTED");

    eventBus.emit("voyage.incident.reported", {
      incidentId: incident.id,
      voyageId: data.voyageId,
      type: data.type,
      severity: incident.severity,
    });

    return { id: incident.id };
  }

  async updateIncident(id: string, data: UpdateIncidentInput, actorId?: string): Promise<void> {
    const incident = await incidentRepository.findById(id);
    if (!incident) {
      throw new Error("Incident not found");
    }

    await incidentRepository.update(id, data);

    auditService.logRoleAssigned(actorId ?? "system", id, "INCIDENT_UPDATED");
  }

  async getIncident(id: string) {
    return incidentRepository.findById(id);
  }

  async getVoyageIncidents(voyageId: string) {
    return incidentRepository.findByVoyage(voyageId);
  }

  async getIncidentsBySeverity(severity: string, limit = 100) {
    return incidentRepository.findBySeverity(severity as any, limit);
  }
}

export const voyageService = new VoyageService();
export const crewService = new CrewService();
export const manifestService = new ManifestService();
export const readinessService = new ReadinessService();
export const incidentService = new IncidentService();