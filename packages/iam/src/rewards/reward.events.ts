export interface RewardCreatedEvent {
  rewardId: string;
  bookingId: string;
  partnerId: string;
  pointsEarned: number;
  cashValue: number;
}

export interface RewardPaidEvent {
  rewardId: string;
  partnerId: string;
  pointsEarned: number;
  cashValue: number;
}

export interface RewardReversedEvent {
  rewardId: string;
  partnerId: string;
  reason?: string;
}

export interface RewardRuleCreatedEvent {
  ruleId: string;
  ruleName: string;
  version: number;
}

export interface RewardRuleUpdatedEvent {
  ruleId: string;
  ruleName: string;
  version: number;
}
