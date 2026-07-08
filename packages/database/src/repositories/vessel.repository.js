import { prisma } from "../client";
import { VesselStatus, DepartureStatus, } from "@prisma/client";
export class VesselRepository {
    async findById(id) {
        return prisma.vessel.findUnique({ where: { id } });
    }
    async findByName(name) {
        return prisma.vessel.findUnique({ where: { name } });
    }
    async findByRegistration(registration) {
        return prisma.vessel.findUnique({ where: { registration } });
    }
    async findActive() {
        return prisma.vessel.findMany({
            where: { status: VesselStatus.ACTIVE },
            orderBy: { name: "asc" },
        });
    }
    async findAll() {
        return prisma.vessel.findMany({
            orderBy: { name: "asc" },
        });
    }
    async findWithMaintenanceHistory(vesselId) {
        return prisma.vessel.findUnique({
            where: { id: vesselId },
            include: {
                departures: {
                    where: { status: { not: DepartureStatus.CANCELLED } },
                    orderBy: { departureDateTime: "desc" },
                    take: 20,
                },
                maintenanceLogs: {
                    orderBy: { performedAt: "desc" },
                    take: 50,
                },
            },
        });
    }
    async create(data) {
        return prisma.vessel.create({ data });
    }
    async update(id, data) {
        return prisma.vessel.update({ where: { id }, data });
    }
    async deactivate(id) {
        return prisma.vessel.update({ where: { id }, data: { status: VesselStatus.INACTIVE } });
    }
    async activate(id) {
        return prisma.vessel.update({ where: { id }, data: { status: VesselStatus.ACTIVE } });
    }
    async setMaintenance(id) {
        return prisma.vessel.update({ where: { id }, data: { status: VesselStatus.MAINTENANCE } });
    }
    async decommission(id) {
        return prisma.vessel.update({ where: { id }, data: { status: VesselStatus.DECOMMISSIONED } });
    }
    async addMaintenanceLog(data) {
        return prisma.vesselMaintenanceLog.create({ data });
    }
    async updateMaintenanceLog(vesselId, logId, data) {
        return prisma.vesselMaintenanceLog.update({
            where: { id: logId },
            data,
        });
    }
    async deleteMaintenanceLog(logId) {
        return prisma.vesselMaintenanceLog.delete({ where: { id: logId } });
    }
    async getMaintenanceHistory(vesselId, limit = 50) {
        return prisma.vesselMaintenanceLog.findMany({
            where: { vesselId },
            orderBy: { performedAt: "desc" },
            take: limit,
        });
    }
    async hasActiveDepartures(vesselId) {
        const count = await prisma.departure.count({
            where: {
                vesselId,
                status: {
                    in: [
                        DepartureStatus.SCHEDULED,
                        DepartureStatus.BOARDING,
                        DepartureStatus.DEPARTED,
                    ],
                },
            },
        });
        return count > 0;
    }
}
export const vesselRepository = new VesselRepository();
