import { rewardRepository } from "@blue-pineapple/database";
import { eventBus } from "../events";
import { rewardService } from "./reward.service";
import type { BookingCompletedEvent } from "../bookings/booking.events";

export class RewardEngine {
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.unsubscribeBookingCompleted = eventBus.on(
      "booking.completed",
      this.handleBookingCompleted
    );
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.unsubscribeBookingCompleted?.();
  }

  private unsubscribeBookingCompleted: (() => void) | null = null;

  private handleBookingCompleted = async (event: BookingCompletedEvent) => {
    try {
      await this.processBookingCompletion(event);
    } catch (error) {
      console.error("[REWARD_ENGINE] Failed to process booking completion:", error);
    }
  };

  private async processBookingCompletion(event: BookingCompletedEvent): Promise<void> {
    const existing = await rewardRepository.findByBooking(event.bookingId);
    if (existing) {
      return;
    }

    const rule = await rewardRepository.findActiveRule(event.partnerId, [], []);

    if (!rule) {
      return;
    }

    const description = `Reward for booking ${event.bookingReference} via rule ${rule.name}`;

    await rewardService.createRewardTransaction(
      event.partnerId,
      event.bookingId,
      rule.id,
      rule.pointsPerBooking,
      rule.cashMultiplier ? Number(rule.cashMultiplier) : 0,
      rule.currency ?? "KES",
      description
    );
  }
}

export const rewardEngine = new RewardEngine();
