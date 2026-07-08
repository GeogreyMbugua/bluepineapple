import type { VoyageStatus, ManifestStatus, ReadinessCheckType } from "@prisma/client";
import { VOYAGE_STATUS, MANIFEST_STATUS, READINESS_CHECKS } from "../constants/operations.constants";

export class OperationsPolicy {
  static TERMINAL_STATUSES: VoyageStatus[] = [
    VOYAGE_STATUS.COMPLETED,
    VOYAGE_STATUS.CANCELLED,
    VOYAGE_STATUS.ABORTED,
  ];

  static MODIFIABLE_STATUSES: VoyageStatus[] = [
    VOYAGE_STATUS.PLANNED,
    VOYAGE_STATUS.READY,
    VOYAGE_STATUS.BOARDING,
    VOYAGE_STATUS.DEPARTED,
    VOYAGE_STATUS.ARRIVED,
  ];

  static canAssignCaptain(status: VoyageStatus): boolean {
    return !this.TERMINAL_STATUSES.includes(status);
  }

  static canAssignCrew(status: VoyageStatus): boolean {
    return !this.TERMINAL_STATUSES.includes(status);
  }

  static canGenerateManifest(status: VoyageStatus): boolean {
    return status === VOYAGE_STATUS.PLANNED || status === VOYAGE_STATUS.READY;
  }

  static canCheckIn(status: ManifestStatus): boolean {
    return status === MANIFEST_STATUS.RESERVED;
  }

  static canBoard(status: ManifestStatus): boolean {
    return status === MANIFEST_STATUS.CHECKED_IN;
  }

  static canDepart(status: VoyageStatus): boolean {
    return status === VOYAGE_STATUS.READY;
  }

  static canArrive(status: VoyageStatus): boolean {
    return status === VOYAGE_STATUS.DEPARTED;
  }

  static canComplete(status: VoyageStatus): boolean {
    return status === VOYAGE_STATUS.ARRIVED;
  }

  static canCancel(status: VoyageStatus): boolean {
    return !this.TERMINAL_STATUSES.includes(status);
  }

  static assertModifiable(status: VoyageStatus): void {
    if (this.TERMINAL_STATUSES.includes(status)) {
      throw new Error(`Cannot modify voyage in terminal status: ${status}`);
    }
  }

  static assertTransition(from: VoyageStatus, to: VoyageStatus): void {
    const validTransitions: Record<string, VoyageStatus[]> = {
      [VOYAGE_STATUS.PLANNED]: [VOYAGE_STATUS.READY, VOYAGE_STATUS.BOARDING, VOYAGE_STATUS.CANCELLED],
      [VOYAGE_STATUS.READY]: [VOYAGE_STATUS.BOARDING, VOYAGE_STATUS.CANCELLED],
      [VOYAGE_STATUS.BOARDING]: [VOYAGE_STATUS.DEPARTED, VOYAGE_STATUS.CANCELLED],
      [VOYAGE_STATUS.DEPARTED]: [VOYAGE_STATUS.ARRIVED, VOYAGE_STATUS.ABORTED],
      [VOYAGE_STATUS.ARRIVED]: [VOYAGE_STATUS.COMPLETED],
      [VOYAGE_STATUS.CANCELLED]: [],
      [VOYAGE_STATUS.ABORTED]: [VOYAGE_STATUS.COMPLETED],
      [VOYAGE_STATUS.COMPLETED]: [],
    };

    const allowed = validTransitions[from] ?? [];
    if (!allowed.includes(to)) {
      throw new Error(
        `Invalid voyage status transition: ${from} → ${to}. Valid transitions from ${from}: ${allowed.join(", ") || "none"}`
      );
    }
  }

  static isTerminal(status: VoyageStatus): boolean {
    return this.TERMINAL_STATUSES.includes(status);
  }

  static validateReadiness(checks: { checkType: ReadinessCheckType; status: boolean }[]): boolean {
    const allRequired = READINESS_CHECKS.every((checkType) => {
      const check = checks.find((c) => c.checkType === checkType);
      return check ? check.status : false;
    });
    return allRequired;
  }

  static async validateVesselReadiness(voyageId: string, checkRepository: { allChecksPassed: (id: string) => Promise<boolean> }): Promise<void> {
    const allPassed = await checkRepository.allChecksPassed(voyageId);
    if (!allPassed) {
      throw new Error("Vessel is not ready. All readiness checks must pass before departure.");
    }
  }
}

export class ManifestPolicy {
  static canUpdateStatus(from: ManifestStatus, to: ManifestStatus): boolean {
    const validTransitions: Record<string, ManifestStatus[]> = {
      [MANIFEST_STATUS.RESERVED]: [MANIFEST_STATUS.CHECKED_IN, MANIFEST_STATUS.NO_SHOW, MANIFEST_STATUS.CANCELLED],
      [MANIFEST_STATUS.CHECKED_IN]: [MANIFEST_STATUS.BOARDED, MANIFEST_STATUS.NO_SHOW],
      [MANIFEST_STATUS.BOARDED]: [MANIFEST_STATUS.ON_VOYAGE, MANIFEST_STATUS.NO_SHOW],
      [MANIFEST_STATUS.ON_VOYAGE]: [MANIFEST_STATUS.COMPLETED, MANIFEST_STATUS.NO_SHOW],
      [MANIFEST_STATUS.COMPLETED]: [],
      [MANIFEST_STATUS.NO_SHOW]: [],
      [MANIFEST_STATUS.CANCELLED]: [],
    };

    return validTransitions[from]?.includes(to) ?? false;
  }

  static assertTransition(from: ManifestStatus, to: ManifestStatus): void {
    if (!this.canUpdateStatus(from, to)) {
      throw new Error(
        `Invalid manifest status transition: ${from} → ${to}`
      );
    }
  }

  static isTerminal(status: ManifestStatus): boolean {
    return status === MANIFEST_STATUS.COMPLETED || status === MANIFEST_STATUS.NO_SHOW || status === MANIFEST_STATUS.CANCELLED;
  }
}