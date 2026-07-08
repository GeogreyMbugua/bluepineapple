import type { RewardRule, RewardStatus } from "@prisma/client";

export interface RewardTransactionData {
  id: string;
  bookingId: string;
  partnerId: string;
  ruleId: string;
  version: number;
  pointsEarned: number;
  cashValue?: number | null;
  currency: string;
  status: RewardStatus;
  description?: string | null;
  metadata?: any;
  createdAt: Date;
  processedAt?: Date | null;
  rule?: RewardRule;
  partner?: {
    id: string;
    partnerCode: string;
    user: { firstName: string; lastName: string };
  };
  booking?: {
    id: string;
    bookingReference: string;
    totalGuests: number;
    totalAmount: number;
    departure: {
      experienceId: string;
      routeId: string;
      experience: { id: string; name: string };
      route: { id: string; name: string };
    };
  };
}

export interface RewardRuleData {
  id: string;
  name: string;
  version: number;
  description?: string | null;
  pointsPerBooking: number;
  cashMultiplier?: number | null;
  currency: string;
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  minGuests: number;
  maxGuests?: number | null;
  experienceIds: string[];
  routeIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RewardCalculationInput {
  totalAmount: number;
  totalGuests: number;
  experienceId: string;
  routeId: string;
}

export interface RewardCalculationResult {
  pointsEarned: number;
  cashValue: number;
  currency: string;
  ruleId: string;
  ruleName: string;
  description: string;
}

export interface CreateRewardRuleInput {
  name: string;
  description?: string;
  pointsPerBooking: number;
  cashMultiplier?: number;
  currency?: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  minGuests?: number;
  maxGuests?: number;
  experienceIds?: string[];
  routeIds?: string[];
}

export interface UpdateRewardRuleInput {
  name?: string;
  description?: string;
  pointsPerBooking?: number;
  cashMultiplier?: number;
  currency?: string;
  isActive?: boolean;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  minGuests?: number;
  maxGuests?: number;
  experienceIds?: string[];
  routeIds?: string[];
}

export interface RewardSearchInput {
  partnerId?: string;
  status?: RewardStatus;
  page?: number;
  limit?: number;
}
