import { prisma, routeRepository } from "@blue-pineapple/database";
import { auditService } from "../audit/audit.service";
import { eventBus } from "../events";
import type {
  CreateRouteInput,
  UpdateRouteInput,
  AssignStopInput,
  ReorderStopInput,
} from "./route.validators";
import type {
  RouteCreatedEvent,
  RouteUpdatedEvent,
  RouteArchivedEvent,
  StopAssignedEvent,
  StopReorderedEvent,
} from "./route.events";

export class RouteService {
  async createRoute(data: CreateRouteInput): Promise<{ id: string; code: string }> {
    const codeUpper = data.code.toUpperCase();
    const exists = await routeRepository.routeCodeExists(codeUpper);
    if (exists) {
      throw new Error(`Route with code "${codeUpper}" already exists`);
    }

    const route = await routeRepository.create({
      name: data.name,
      code: codeUpper,
      description: data.description,
      estimatedDurationMinutes: data.estimatedDurationMinutes,
      isActive: data.isActive,
    });

    auditService.logRoleAssigned("system", route.id, "ROUTE_CREATED");

    eventBus.emit("route.created", {
      routeId: route.id,
      routeCode: route.code,
      routeName: route.name,
    } as RouteCreatedEvent);

    return { id: route.id, code: route.code };
  }

  async updateRoute(id: string, data: UpdateRouteInput): Promise<{ id: string; code: string }> {
    const existing = await routeRepository.findById(id);
    if (!existing) {
      throw new Error("Route not found");
    }

    if (data.code && data.code !== existing.code) {
      const codeUpper = data.code.toUpperCase();
      const codeTaken = await routeRepository.routeCodeExists(codeUpper);
      if (codeTaken) {
        throw new Error(`Route code "${codeUpper}" is already in use`);
      }
    }

    const updated = await routeRepository.update(id, {
      name: data.name,
      code: data.code?.toUpperCase(),
      description: data.description,
      estimatedDurationMinutes: data.estimatedDurationMinutes,
      isActive: data.isActive,
    });

    auditService.logRoleAssigned("system", id, "ROUTE_UPDATED");

    eventBus.emit("route.updated", {
      routeId: id,
      routeCode: updated.code,
    } as RouteUpdatedEvent);

    return { id: updated.id, code: updated.code };
  }

  async archiveRoute(id: string): Promise<void> {
    const existing = await routeRepository.findById(id);
    if (!existing) {
      throw new Error("Route not found");
    }

    const hasDepartures = await routeRepository.hasActiveDepartures(id);
    if (hasDepartures) {
      throw new Error("Cannot archive route with active departures");
    }

    await routeRepository.archive(id);

    auditService.logRoleAssigned("system", id, "ROUTE_ARCHIVED");

    eventBus.emit("route.archived", {
      routeId: id,
      routeCode: existing.code,
    } as RouteArchivedEvent);
  }

  async listActiveRoutes() {
    return routeRepository.findActive();
  }

  async getRoute(id: string) {
    const route = await routeRepository.findWithStops(id);
    if (!route) {
      throw new Error("Route not found");
    }
    return route;
  }

  async getStops(routeId: string) {
    const route = await routeRepository.findById(routeId);
    if (!route) {
      throw new Error("Route not found");
    }
    return routeRepository.listStops(routeId);
  }

  async assignStop(routeId: string, data: AssignStopInput): Promise<{ id: string; sequence: number }> {
    const route = await routeRepository.findById(routeId);
    if (!route) {
      throw new Error("Route not found");
    }

    const existingStop = await routeRepository.findStop(routeId, data.sequence);
    if (existingStop) {
      throw new Error(`Stop with sequence ${data.sequence} already exists on this route`);
    }

    if (data.code) {
      const codeExists = await routeRepository.findStopByCode(routeId, data.code);
      if (codeExists) {
        throw new Error(`Stop code "${data.code}" already exists on this route`);
      }
    }

    const stop = await routeRepository.assignStop({
      route: { connect: { id: routeId } },
      name: data.name,
      code: data.code,
      sequence: data.sequence,
      latitude: data.latitude,
      longitude: data.longitude,
      isPickupPoint: data.isPickupPoint ?? true,
      isDropoffPoint: data.isDropoffPoint ?? true,
      estimatedArrivalMinutes: data.estimatedArrivalMinutes,
      notes: data.notes,
    });

    auditService.logRoleAssigned("system", routeId, "STOP_ASSIGNED");

    eventBus.emit("stop.assigned", {
      routeId,
      stopId: stop.id,
      stopName: stop.name,
      sequence: stop.sequence,
    } as StopAssignedEvent);

    return { id: stop.id, sequence: stop.sequence };
  }

  async reorderStops(routeId: string, data: ReorderStopInput): Promise<void> {
    const route = await routeRepository.findById(routeId);
    if (!route) {
      throw new Error("Route not found");
    }

    const stops = await routeRepository.listStops(routeId);
    const stopMap = new Map(stops.map(s => [s.sequence, s]));

    if (!stopMap.has(data.oldSequence)) {
      throw new Error("Source stop not found");
    }
    if (stopMap.has(data.newSequence)) {
      throw new Error("Target sequence is already occupied");
    }

    await prisma.$transaction(async (tx) => {
      const oldSeq = data.oldSequence;
      const newSeq = data.newSequence;

      if (newSeq > oldSeq) {
        await tx.routeStop.updateMany({
          where: { routeId, sequence: { gt: oldSeq, lte: newSeq } },
          data: { sequence: { decrement: 1 } },
        });
      } else {
        await tx.routeStop.updateMany({
          where: { routeId, sequence: { gte: newSeq, lt: oldSeq } },
          data: { sequence: { increment: 1 } },
        });
      }

      await tx.routeStop.update({
        where: { routeId_sequence: { routeId, sequence: oldSeq } },
        data: { sequence: newSeq },
      });
    });

    auditService.logRoleAssigned("system", routeId, "STOPS_REORDERED");

    eventBus.emit("stop.reordered", {
      routeId,
      oldSequence: data.oldSequence,
      newSequence: data.newSequence,
    } as StopReorderedEvent);
  }
}

export const routeService = new RouteService();
