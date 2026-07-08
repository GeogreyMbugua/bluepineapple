import { prisma } from "../client";
import { DepartureStatus, } from "@prisma/client";
export class RouteRepository {
    async findById(id) {
        return prisma.route.findUnique({ where: { id } });
    }
    async findActive() {
        return prisma.route.findMany({
            where: { isActive: true },
            orderBy: { name: "asc" },
        });
    }
    async findWithStops(routeId) {
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
    async create(data) {
        return prisma.route.create({ data });
    }
    async update(id, data) {
        return prisma.route.update({ where: { id }, data });
    }
    async archive(id) {
        return prisma.route.update({ where: { id }, data: { isActive: false } });
    }
    async assignStop(data) {
        return prisma.routeStop.create({ data });
    }
    async findStop(routeId, sequence) {
        return prisma.routeStop.findUnique({
            where: { routeId_sequence: { routeId, sequence } },
        });
    }
    async findStopByCode(routeId, code) {
        return prisma.routeStop.findFirst({
            where: { routeId, code },
        });
    }
    async listStops(routeId) {
        return prisma.routeStop.findMany({
            where: { routeId },
            orderBy: { sequence: "asc" },
        });
    }
    async hasActiveDepartures(routeId) {
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
    async routeCodeExists(code) {
        const count = await prisma.route.count({ where: { code } });
        return count > 0;
    }
}
export const routeRepository = new RouteRepository();
