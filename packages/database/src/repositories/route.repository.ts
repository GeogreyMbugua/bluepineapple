import { prisma } from "../client";
import {
  Route,
  RouteStop,
  DepartureStatus,
} from "@prisma/client";

export class RouteRepository {
  async findById(id: string): Promise<Route | null> {
    return prisma.route.findUnique({ where: { id } });
  }

  async findActive(): Promise<Route[]> {
    return prisma.route.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  }

  async findWithStops(routeId: string) {
    return prisma.route.findUnique({
      where: { id: routeId },
      include: {
        stops: { orderBy: { sequence: "asc" } },
        experienceRoutes: {
          include: { experience: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  }

  async create(data: any): Promise<Route> {
    return prisma.route.create({ data });
  }

  async update(id: string, data: any): Promise<Route> {
    return prisma.route.update({ where: { id }, data });
  }

  async archive(id: string): Promise<Route> {
    return prisma.route.update({ where: { id }, data: { isActive: false } });
  }

  async assignStop(data: any): Promise<RouteStop> {
    return prisma.routeStop.create({ data });
  }

  async findStop(routeId: string, sequence: number): Promise<RouteStop | null> {
    return prisma.routeStop.findUnique({
      where: { routeId_sequence: { routeId, sequence } },
    });
  }

  async findStopByCode(routeId: string, code: string): Promise<RouteStop | null> {
    return prisma.routeStop.findFirst({
      where: { routeId, code },
    });
  }

  async listStops(routeId: string) {
    return prisma.routeStop.findMany({
      where: { routeId },
      orderBy: { sequence: "asc" },
    });
  }

  async hasActiveDepartures(routeId: string): Promise<boolean> {
    const count = await prisma.departure.count({
      where: {
        routeId,
        status: {
          in: [DepartureStatus.SCHEDULED, DepartureStatus.BOARDING, DepartureStatus.DEPARTED],
        },
      },
    });
    return count > 0;
  }

  async routeCodeExists(code: string): Promise<boolean> {
    const count = await prisma.route.count({ where: { code } });
    return count > 0;
  }
}

export const routeRepository = new RouteRepository();
