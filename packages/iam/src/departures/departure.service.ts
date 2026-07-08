import { departureRepository, experienceRepository, routeRepository, vesselRepository } from "@blue-pineapple/database";
import { auditService } from "../audit/audit.service";
import { eventBus } from "../events";
import { DeparturePolicy } from "../policies/departure.policy";
import { ExperiencePolicy } from "../policies/experience.policy";
import { FleetPolicy } from "../policies/fleet.policy";
import { bookingCapacityService } from "../bookings/booking-capacity.service";
import type {
  CreateDepartureInput,
  UpdateDepartureInput,
  DepartureSearchInput,
  AssignVesselInput,
  AssignRouteInput,
  AssignExperienceInput,
} from "./departure.validators";
import type {
  DepartureCreatedEvent,
  DeparturePublishedEvent,
  DepartureCancelledEvent,
  DepartureRescheduledEvent,
  DepartureClosedEvent,
  DepartureAssignedEvent,
  DepartureUpdatedEvent,
} from "./departure.events";

export class DepartureService {
  async createDeparture(data: CreateDepartureInput): Promise<{ id: string }> {
    const [vessel, route] = await Promise.all([
      vesselRepository.findById(data.vesselId),
      routeRepository.findById(data.routeId),
    ]);

    if (!vessel) {
      throw new Error("Vessel not found");
    }
    if (!route) {
      throw new Error("Route not found");
    }
    if (!route.isActive) {
      throw new Error("Cannot create departure for an archived route");
    }
    FleetPolicy.assertActive(vessel.status);
    if (data.totalCapacity > vessel.capacity) {
      throw new Error(
        `Departure capacity (${data.totalCapacity}) exceeds vessel capacity (${vessel.capacity})`
      );
    }

    const departure = await departureRepository.create({
      vessel: { connect: { id: data.vesselId } },
      route: { connect: { id: data.routeId } },
      experience: { connect: { id: data.experienceId } },
      departureDateTime: data.departureDateTime,
      arrivalDateTime: data.arrivalDateTime,
      totalCapacity: data.totalCapacity,
      availableCapacity: data.totalCapacity,
      status: "SCHEDULED",
      specialInstructions: data.specialInstructions,
    });

    auditService.logRoleAssigned("system", departure.id, "DEPARTURE_CREATED");

    eventBus.emit("departure.created", {
      departureId: departure.id,
      experienceId: data.experienceId,
      routeId: data.routeId,
      vesselId: data.vesselId,
      departureDateTime: departure.departureDateTime.toISOString(),
    } as DepartureCreatedEvent);

    return { id: departure.id };
  }

  async publishDeparture(id: string): Promise<void> {
    const departure = await departureRepository.findById(id);
    if (!departure) {
      throw new Error("Departure not found");
    }
    DeparturePolicy.assertModifiable(departure.status);
    DeparturePolicy.assertTransition(departure.status, "BOARDING");

    if (!departure.vessel || departure.vessel.status !== "ACTIVE") {
      throw new Error("Cannot publish departure without an active vessel");
    }

    if (!departure.route || !departure.route.isActive) {
      throw new Error("Cannot publish departure without an active route");
    }

    await departureRepository.update(id, { status: "BOARDING" });

    auditService.logRoleAssigned("system", id, "DEPARTURE_PUBLISHED");

    eventBus.emit("departure.published", { departureId: id } as DeparturePublishedEvent);
  }

  async cancelDeparture(id: string, reason?: string): Promise<void> {
    const departure = await departureRepository.findById(id);
    if (!departure) {
      throw new Error("Departure not found");
    }
    DeparturePolicy.assertModifiable(departure.status);
    DeparturePolicy.assertTransition(departure.status, "CANCELLED");

    const hasBookings = await departureRepository.hasBookings(id);
    if (hasBookings) {
      await departureRepository.cancel(id);
    } else {
      await departureRepository.update(id, { status: "CANCELLED", cancellationReason: reason, cancelledAt: new Date() });
    }

    auditService.logRoleAssigned("system", id, "DEPARTURE_CANCELLED");

    eventBus.emit("departure.cancelled", {
      departureId: id,
      reason,
    } as DepartureCancelledEvent);
  }

  async closeDeparture(id: string): Promise<void> {
    const departure = await departureRepository.findById(id);
    if (!departure) {
      throw new Error("Departure not found");
    }
    DeparturePolicy.assertModifiable(departure.status);
    DeparturePolicy.assertTransition(departure.status, "COMPLETED");

    await departureRepository.close(id);

    auditService.logRoleAssigned("system", id, "DEPARTURE_CLOSED");

    eventBus.emit("departure.closed", { departureId: id } as DepartureClosedEvent);
  }

  async rescheduleDeparture(id: string, newDateTime: Date): Promise<void> {
    const departure = await departureRepository.findById(id);
    if (!departure) {
      throw new Error("Departure not found");
    }
    DeparturePolicy.assertModifiable(departure.status);

    const hasBookings = await departureRepository.hasBookings(id);
    if (hasBookings) {
      throw new Error("Cannot reschedule departure with existing bookings");
    }

    const oldDateTime = departure.departureDateTime;
    await departureRepository.update(id, { departureDateTime: newDateTime });

    auditService.logRoleAssigned("system", id, "DEPARTURE_RESCHEDULED");

    eventBus.emit("departure.rescheduled", {
      departureId: id,
      oldDateTime: oldDateTime.toISOString(),
      newDateTime: newDateTime.toISOString(),
    } as DepartureRescheduledEvent);
  }

  async assignVessel(id: string, data: AssignVesselInput): Promise<void> {
    const departure = await departureRepository.findById(id);
    if (!departure) {
      throw new Error("Departure not found");
    }
    DeparturePolicy.assertModifiable(departure.status);

    const vessel = await vesselRepository.findById(data.vesselId);
    if (!vessel) {
      throw new Error("Vessel not found");
    }
    FleetPolicy.assertActive(vessel.status);

    if (data.vesselId !== departure.vesselId) {
      const hasBookings = await departureRepository.hasBookings(id);
      if (hasBookings) {
        throw new Error("Cannot change vessel for departure with existing bookings");
      }
    }

    await departureRepository.update(id, { vessel: { connect: { id: data.vesselId } } });

    auditService.logRoleAssigned("system", id, "DEPARTURE_VESSEL_ASSIGNED");

    eventBus.emit("departure.assigned", {
      departureId: id,
      vesselId: data.vesselId,
    } as DepartureAssignedEvent);
  }

  async assignRoute(id: string, data: AssignRouteInput): Promise<void> {
    const departure = await departureRepository.findById(id);
    if (!departure) {
      throw new Error("Departure not found");
    }
    DeparturePolicy.assertModifiable(departure.status);

    const route = await routeRepository.findById(data.routeId);
    if (!route) {
      throw new Error("Route not found");
    }
    if (!route.isActive) {
      throw new Error("Cannot assign an archived route");
    }

    const hasBookings = await departureRepository.hasBookings(id);
    if (hasBookings && data.routeId !== departure.routeId) {
      throw new Error("Cannot change route for departure with existing bookings");
    }

    await departureRepository.update(id, { route: { connect: { id: data.routeId } } });

    auditService.logRoleAssigned("system", id, "DEPARTURE_ROUTE_ASSIGNED");

    eventBus.emit("departure.assigned", {
      departureId: id,
      routeId: data.routeId,
    } as DepartureAssignedEvent);
  }

  async assignExperience(id: string, data: AssignExperienceInput): Promise<void> {
    const departure = await departureRepository.findById(id);
    if (!departure) {
      throw new Error("Departure not found");
    }
    DeparturePolicy.assertModifiable(departure.status);

    const experience = await experienceRepository.findById(data.experienceId);
    if (!experience) {
      throw new Error("Experience not found");
    }
    ExperiencePolicy.assertAssignable(experience.isActive);

    await departureRepository.update(id, { experience: { connect: { id: data.experienceId } } });

    auditService.logRoleAssigned("system", id, "DEPARTURE_EXPERIENCE_ASSIGNED");

    eventBus.emit("departure.assigned", {
      departureId: id,
      experienceId: data.experienceId,
    } as DepartureAssignedEvent);
  }

  async updateDeparture(id: string, data: UpdateDepartureInput): Promise<void> {
    const departure = await departureRepository.findById(id);
    if (!departure) {
      throw new Error("Departure not found");
    }
    DeparturePolicy.assertModifiable(departure.status);

    if (data.totalCapacity !== undefined && data.totalCapacity !== departure.totalCapacity) {
      const vessel = await vesselRepository.findById(departure.vesselId);
      if (vessel && data.totalCapacity > vessel.capacity) {
        throw new Error(
          `Departure capacity (${data.totalCapacity}) exceeds vessel capacity (${vessel.capacity})`
        );
      }
    }

    const updateData: any = {};
    if (data.departureDateTime) updateData.departureDateTime = data.departureDateTime;
    if (data.arrivalDateTime !== undefined) updateData.arrivalDateTime = data.arrivalDateTime;
    if (data.totalCapacity !== undefined) updateData.totalCapacity = data.totalCapacity;
    if (data.specialInstructions !== undefined) updateData.specialInstructions = data.specialInstructions;

    const updated = await departureRepository.updateIfUnchanged(id, departure.updatedAt, updateData);
    if (!updated) {
      throw new Error("Departure was modified by another administrator. Please reload and try again.");
    }

    auditService.logRoleAssigned("system", id, "DEPARTURE_UPDATED");

    eventBus.emit("departure.updated", { departureId: id } as DepartureUpdatedEvent);
  }

  async getDeparture(id: string) {
    return departureRepository.findById(id);
  }

  async searchDepartures(input: DepartureSearchInput) {
    return departureRepository.findByStatus(input.status ?? "SCHEDULED", input.limit ?? 20);
  }

  async getUpcomingDepartures(limit = 50) {
    return departureRepository.findUpcoming(limit);
  }

  async getCapacityInfo(departureId: string) {
    return bookingCapacityService.getCapacityInfo(departureId);
  }
}

export const departureService = new DepartureService();
