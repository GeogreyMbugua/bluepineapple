import { vesselRepository } from "@blue-pineapple/database";
import { auditService } from "../audit/audit.service";
import { eventBus } from "../events";
import { FleetPolicy } from "../policies/fleet.policy";
export class VesselService {
    async createVessel(data) {
        const nameUpper = data.name.toUpperCase();
        const exists = await vesselRepository.findByName(nameUpper);
        if (exists) {
            throw new Error(`Vessel with name "${nameUpper}" already exists`);
        }
        if (data.registration) {
            const regExists = await vesselRepository.findByRegistration(data.registration);
            if (regExists) {
                throw new Error(`Vessel with registration "${data.registration}" already exists`);
            }
        }
        const vessel = await vesselRepository.create({
            name: nameUpper,
            registration: data.registration,
            capacity: data.capacity,
            type: data.type,
            operatorName: data.operatorName,
            ownerName: data.ownerName,
            notes: data.notes,
            status: "ACTIVE",
        });
        auditService.logRoleAssigned("system", vessel.id, "VESSEL_CREATED");
        eventBus.emit("vessel.created", {
            vesselId: vessel.id,
            vesselName: vessel.name,
            registration: vessel.registration ?? undefined,
        });
        return { id: vessel.id, name: vessel.name };
    }
    async updateVessel(data, id) {
        const existing = await vesselRepository.findById(id);
        if (!existing) {
            throw new Error("Vessel not found");
        }
        if (data.name && data.name !== existing.name) {
            const nameUpper = data.name.toUpperCase();
            const nameTaken = await vesselRepository.findByName(nameUpper);
            if (nameTaken) {
                throw new Error(`Vessel name "${nameUpper}" is already in use`);
            }
        }
        if (data.registration && data.registration !== existing.registration) {
            const regTaken = await vesselRepository.findByRegistration(data.registration);
            if (regTaken) {
                throw new Error(`Vessel registration "${data.registration}" is already in use`);
            }
        }
        const updated = await vesselRepository.update(id, {
            name: data.name?.toUpperCase(),
            registration: data.registration,
            capacity: data.capacity,
            type: data.type,
            operatorName: data.operatorName,
            ownerName: data.ownerName,
            notes: data.notes,
        });
        auditService.logRoleAssigned("system", id, "VESSEL_UPDATED");
        eventBus.emit("vessel.updated", {
            vesselId: id,
            vesselName: updated.name,
        });
        return { id: updated.id, name: updated.name };
    }
    async activateVessel(id) {
        const existing = await vesselRepository.findById(id);
        if (!existing) {
            throw new Error("Vessel not found");
        }
        FleetPolicy.assertCanActivate(existing.status);
        FleetPolicy.assertTransition(existing.status, "ACTIVE");
        await vesselRepository.activate(id);
        auditService.logRoleAssigned("system", id, "VESSEL_ACTIVATED");
        eventBus.emit("vessel.activated", {
            vesselId: id,
            vesselName: existing.name,
        });
    }
    async deactivateVessel(id) {
        const existing = await vesselRepository.findById(id);
        if (!existing) {
            throw new Error("Vessel not found");
        }
        FleetPolicy.assertCanDeactivate(existing.status);
        FleetPolicy.assertTransition(existing.status, "INACTIVE");
        await vesselRepository.deactivate(id);
        auditService.logRoleAssigned("system", id, "VESSEL_DEACTIVATED");
        eventBus.emit("vessel.deactivated", {
            vesselId: id,
            vesselName: existing.name,
        });
    }
    async decommissionVessel(id) {
        const existing = await vesselRepository.findById(id);
        if (!existing) {
            throw new Error("Vessel not found");
        }
        FleetPolicy.assertCanDecommission(existing.status);
        FleetPolicy.assertTransition(existing.status, "DECOMMISSIONED");
        const hasActive = await vesselRepository.hasActiveDepartures(id);
        if (hasActive) {
            throw new Error("Cannot decommission vessel with active departures");
        }
        await vesselRepository.decommission(id);
        auditService.logRoleAssigned("system", id, "VESSEL_DECOMMISSIONED");
        eventBus.emit("vessel.decommissioned", {
            vesselId: id,
            vesselName: existing.name,
        });
    }
    async getVessel(id) {
        const vessel = await vesselRepository.findWithMaintenanceHistory(id);
        if (!vessel) {
            throw new Error("Vessel not found");
        }
        return vessel;
    }
    async listActiveVessels() {
        return vesselRepository.findActive();
    }
    async listAllVessels() {
        return vesselRepository.findAll();
    }
}
export const vesselService = new VesselService();
