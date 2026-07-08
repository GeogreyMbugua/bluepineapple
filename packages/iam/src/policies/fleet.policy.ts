import type { VesselStatus } from "@prisma/client";
import { VESSEL_STATUS } from "../constants/fleet.constants";

export class FleetPolicy {
  private static readonly VALID_TRANSITIONS: Record<string, string[]> = {
    [VESSEL_STATUS.ACTIVE]: [VESSEL_STATUS.MAINTENANCE, VESSEL_STATUS.INACTIVE, VESSEL_STATUS.DECOMMISSIONED],
    [VESSEL_STATUS.INACTIVE]: [VESSEL_STATUS.ACTIVE, VESSEL_STATUS.DECOMMISSIONED],
    [VESSEL_STATUS.MAINTENANCE]: [VESSEL_STATUS.ACTIVE, VESSEL_STATUS.INACTIVE, VESSEL_STATUS.DECOMMISSIONED],
    [VESSEL_STATUS.DECOMMISSIONED]: [],
  };

  static canTransition(from: VesselStatus, to: VesselStatus): boolean {
    return this.VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  static assertTransition(from: VesselStatus, to: VesselStatus): void {
    if (!this.canTransition(from, to)) {
      const valid = this.VALID_TRANSITIONS[from] ?? [];
      throw new Error(
        `Invalid vessel status transition: ${from} → ${to}. Valid transitions from ${from}: ${valid.join(", ") || "none"}`
      );
    }
  }

  static isDecommissioned(status: VesselStatus): boolean {
    return status === VESSEL_STATUS.DECOMMISSIONED;
  }

  static canScheduleMaintenance(status: VesselStatus): boolean {
    return status !== VESSEL_STATUS.MAINTENANCE && status !== VESSEL_STATUS.DECOMMISSIONED;
  }

  static assertCanScheduleMaintenance(status: VesselStatus): void {
    if (!this.canScheduleMaintenance(status)) {
      throw new Error(`Cannot schedule maintenance for vessel in status: ${status}`);
    }
  }

  static canActivate(status: VesselStatus): boolean {
    return status !== VESSEL_STATUS.ACTIVE && status !== VESSEL_STATUS.DECOMMISSIONED;
  }

  static assertCanActivate(status: VesselStatus): void {
    if (!this.canActivate(status)) {
      throw new Error(`Cannot activate vessel in status: ${status}`);
    }
  }

  static canDeactivate(status: VesselStatus): boolean {
    return status !== VESSEL_STATUS.DECOMMISSIONED;
  }

  static assertCanDeactivate(status: VesselStatus): void {
    if (!this.canDeactivate(status)) {
      throw new Error(`Cannot deactivate vessel in status: ${status}`);
    }
  }

  static canDecommission(_status: VesselStatus): boolean {
    return true;
  }

  static assertCanDecommission(status: VesselStatus): void {
    if (!this.canDecommission(status)) {
      throw new Error(`Cannot decommission vessel in status: ${status}`);
    }
  }

  static isBookable(status: VesselStatus): boolean {
    return status === VESSEL_STATUS.ACTIVE;
  }

  static assertModifiable(status: VesselStatus): void {
    if (status === VESSEL_STATUS.DECOMMISSIONED) {
      throw new Error(
        `Cannot modify vessel in status: ${status}`
      );
    }
  }

  static assertActive(status: VesselStatus): void {
    if (status !== VESSEL_STATUS.ACTIVE) {
      throw new Error(`Vessel must be ACTIVE, current status: ${status}`);
    }
  }
}
