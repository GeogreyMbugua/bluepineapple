import { VOYAGE_STATUS, MANIFEST_STATUS, READINESS_CHECKS } from "../constants/operations.constants";
export class OperationsPolicy {
    static TERMINAL_STATUSES = [
        VOYAGE_STATUS.COMPLETED,
        VOYAGE_STATUS.CANCELLED,
        VOYAGE_STATUS.ABORTED,
    ];
    static MODIFIABLE_STATUSES = [
        VOYAGE_STATUS.PLANNED,
        VOYAGE_STATUS.READY,
        VOYAGE_STATUS.BOARDING,
        VOYAGE_STATUS.DEPARTED,
        VOYAGE_STATUS.ARRIVED,
    ];
    static canAssignCaptain(status) {
        return !this.TERMINAL_STATUSES.includes(status);
    }
    static canAssignCrew(status) {
        return !this.TERMINAL_STATUSES.includes(status);
    }
    static canGenerateManifest(status) {
        return status === VOYAGE_STATUS.PLANNED || status === VOYAGE_STATUS.READY;
    }
    static canCheckIn(status) {
        return status === MANIFEST_STATUS.RESERVED;
    }
    static canBoard(status) {
        return status === MANIFEST_STATUS.CHECKED_IN;
    }
    static canDepart(status) {
        return status === VOYAGE_STATUS.READY;
    }
    static canArrive(status) {
        return status === VOYAGE_STATUS.DEPARTED;
    }
    static canComplete(status) {
        return status === VOYAGE_STATUS.ARRIVED;
    }
    static canCancel(status) {
        return !this.TERMINAL_STATUSES.includes(status);
    }
    static assertModifiable(status) {
        if (this.TERMINAL_STATUSES.includes(status)) {
            throw new Error(`Cannot modify voyage in terminal status: ${status}`);
        }
    }
    static assertTransition(from, to) {
        const validTransitions = {
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
            throw new Error(`Invalid voyage status transition: ${from} → ${to}. Valid transitions from ${from}: ${allowed.join(", ") || "none"}`);
        }
    }
    static isTerminal(status) {
        return this.TERMINAL_STATUSES.includes(status);
    }
    static validateReadiness(checks) {
        const allRequired = READINESS_CHECKS.every((checkType) => {
            const check = checks.find((c) => c.checkType === checkType);
            return check ? check.status : false;
        });
        return allRequired;
    }
    static async validateVesselReadiness(voyageId, checkRepository) {
        const allPassed = await checkRepository.allChecksPassed(voyageId);
        if (!allPassed) {
            throw new Error("Vessel is not ready. All readiness checks must pass before departure.");
        }
    }
}
export class ManifestPolicy {
    static canUpdateStatus(from, to) {
        const validTransitions = {
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
    static assertTransition(from, to) {
        if (!this.canUpdateStatus(from, to)) {
            const valid = this.canUpdateStatus(from, to) ? [] : [];
            throw new Error(`Invalid manifest status transition: ${from} → ${to}`);
        }
    }
    static isTerminal(status) {
        return status === MANIFEST_STATUS.COMPLETED || status === MANIFEST_STATUS.NO_SHOW || status === MANIFEST_STATUS.CANCELLED;
    }
}
