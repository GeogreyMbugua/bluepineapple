import { vesselRepository } from "@blue-pineapple/database";
import { auditService } from "../audit/audit.service";
import { eventBus } from "../events";
import { FleetPolicy } from "../policies/fleet.policy";
import type { MaintenanceLogInput, UpdateMaintenanceLogInput } from "./fleet.validators";
import type {
  VesselMaintenanceScheduledEvent,
  VesselMaintenanceCompletedEvent,
} from "./fleet.events";

export class MaintenanceService {
  async scheduleMaintenance(
    vesselId: string,
    data: MaintenanceLogInput
  ): Promise<{ id: string }> {
    const vessel = await vesselRepository.findById(vesselId);
    if (!vessel) {
      throw new Error("Vessel not found");
    }

    FleetPolicy.assertCanScheduleMaintenance(vessel.status);
    FleetPolicy.assertTransition(vessel.status, "MAINTENANCE");

    await vesselRepository.setMaintenance(vesselId);

    const log = await vesselRepository.addMaintenanceLog({
      vessel: { connect: { id: vesselId } },
      description: data.description,
      performedAt: data.performedAt,
    });

    auditService.logRoleAssigned("system", vesselId, "MAINTENANCE_SCHEDULED");

    eventBus.emit("vessel.maintenance.scheduled", {
      vesselId,
      vesselName: vessel.name,
      maintenanceLogId: log.id,
      performedAt: log.performedAt.toISOString(),
    } as VesselMaintenanceScheduledEvent);

    return { id: log.id };
  }

  async completeMaintenance(
    vesselId: string,
    logId: string,
    data?: UpdateMaintenanceLogInput
  ): Promise<void> {
    const vessel = await vesselRepository.findById(vesselId);
    if (!vessel) {
      throw new Error("Vessel not found");
    }

    FleetPolicy.assertCanActivate(vessel.status);
    FleetPolicy.assertTransition(vessel.status, "ACTIVE");

    const log = await vesselRepository.updateMaintenanceLog(vesselId, logId, {
      description: data?.description,
      performedAt: data?.performedAt,
    });

    await vesselRepository.activate(vesselId);

    auditService.logRoleAssigned("system", vesselId, "MAINTENANCE_COMPLETED");

    eventBus.emit("vessel.maintenance.completed", {
      vesselId,
      vesselName: vessel.name,
      maintenanceLogId: log.id,
    } as VesselMaintenanceCompletedEvent);
  }

  async getMaintenanceHistory(vesselId: string, limit = 50) {
    return vesselRepository.getMaintenanceHistory(vesselId, limit);
  }

  async updateMaintenanceLog(
    vesselId: string,
    logId: string,
    data: UpdateMaintenanceLogInput
  ): Promise<void> {
    await vesselRepository.updateMaintenanceLog(vesselId, logId, {
      description: data.description,
      performedAt: data.performedAt,
    });
  }

  async deleteMaintenanceLog(logId: string): Promise<void> {
    await vesselRepository.deleteMaintenanceLog(logId);
  }
}

export const maintenanceService = new MaintenanceService();
