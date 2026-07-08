import type { RewardStatus } from "@prisma/client";

export class RewardPolicy {
  private static readonly TRANSITIONABLE_STATUSES: RewardStatus[] = ["PENDING", "APPROVED"];

  static canMarkPaid(status: RewardStatus): boolean {
    return this.TRANSITIONABLE_STATUSES.includes(status);
  }

  static assertCanMarkPaid(status: RewardStatus): void {
    if (!this.canMarkPaid(status)) {
      throw new Error(`Cannot mark reward as paid with status: ${status}`);
    }
  }

  static canApprove(status: RewardStatus): boolean {
    return status === "PENDING";
  }

  static assertCanApprove(status: RewardStatus): void {
    if (!this.canApprove(status)) {
      throw new Error(`Cannot approve reward with status: ${status}`);
    }
  }

  static canReverse(status: RewardStatus): boolean {
    return status !== "REVERSED" && status !== "EXPIRED";
  }

  static assertCanReverse(status: RewardStatus): void {
    if (!this.canReverse(status)) {
      throw new Error(`Cannot reverse reward with status: ${status}`);
    }
  }

  static isTerminal(status: RewardStatus): boolean {
    return status === "PAID_OUT" || status === "EXPIRED" || status === "REVERSED";
  }
}
