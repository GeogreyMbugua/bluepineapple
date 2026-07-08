export class RewardPolicy {
    static TRANSITIONABLE_STATUSES = ["PENDING", "APPROVED"];
    static canMarkPaid(status) {
        return this.TRANSITIONABLE_STATUSES.includes(status);
    }
    static assertCanMarkPaid(status) {
        if (!this.canMarkPaid(status)) {
            throw new Error(`Cannot mark reward as paid with status: ${status}`);
        }
    }
    static canApprove(status) {
        return status === "PENDING";
    }
    static assertCanApprove(status) {
        if (!this.canApprove(status)) {
            throw new Error(`Cannot approve reward with status: ${status}`);
        }
    }
    static canReverse(status) {
        return status !== "REVERSED" && status !== "EXPIRED";
    }
    static assertCanReverse(status) {
        if (!this.canReverse(status)) {
            throw new Error(`Cannot reverse reward with status: ${status}`);
        }
    }
    static isTerminal(status) {
        return status === "PAID_OUT" || status === "EXPIRED" || status === "REVERSED";
    }
}
