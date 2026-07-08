import { prisma } from "../client";
import {
  Vessel,
  VesselMaintenanceLog,
  VesselStatus,
  DepartureStatus,
} from "@prisma/client";

export class VesselRepository {
  async findById(id: string): Promise<Vessel | null> {
    return prisma.vessel.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<Vessel | null> {
    return prisma.vessel.findUnique({ where: { name } });
  }

  async findByRegistration(registration: string): Promise<Vessel | null> {
    return prisma.vessel.findUnique({ where: { registration } });
  }

  async findActive(): Promise<Vessel[]> {
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

  async findWithMaintenanceHistory(vesselId: string) {
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

  async create(data: any): Promise<Vessel> {
    return prisma.vessel.create({ data });
  }

  async update(id: string, data: any): Promise<Vessel> {
    return prisma.vessel.update({ where: { id }, data });
  }

  async deactivate(id: string): Promise<Vessel> {
    return prisma.vessel.update({ where: { id }, data: { status: VesselStatus.INACTIVE } });
  }

  async activate(id: string): Promise<Vessel> {
    return prisma.vessel.update({ where: { id }, data: { status: VesselStatus.ACTIVE } });
  }

  async setMaintenance(id: string): Promise<Vessel> {
    return prisma.vessel.update({ where: { id }, data: { status: VesselStatus.MAINTENANCE } });
  }

  async decommission(id: string): Promise<Vessel> {
    return prisma.vessel.update({ where: { id }, data: { status: VesselStatus.DECOMMISSIONED } });
  }

  async addMaintenanceLog(
    data: any
  ): Promise<VesselMaintenanceLog> {
    return prisma.vesselMaintenanceLog.create({ data });
  }

  async updateMaintenanceLog(
    _vesselId: string,
    logId: string,
    data: any
  ): Promise<VesselMaintenanceLog> {
    return prisma.vesselMaintenanceLog.update({
      where: { id: logId },
      data,
    });
  }

  async deleteMaintenanceLog(logId: string): Promise<VesselMaintenanceLog> {
    return prisma.vesselMaintenanceLog.delete({ where: { id: logId } });
  }

  async getMaintenanceHistory(vesselId: string, limit = 50) {
    return prisma.vesselMaintenanceLog.findMany({
      where: { vesselId },
      orderBy: { performedAt: "desc" },
      take: limit,
    });
  }

  async hasActiveDepartures(vesselId: string): Promise<boolean> {
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
