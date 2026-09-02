export interface PartnerProfileData {
  id: string;
  userId: string;
  partnerCode: string;
  companyName?: string | null;
  commissionRate: number;
  status: string;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  firstName?: string | null;
  lastName?: string | null;
  user?: PartnerUserData;
  bookingCount?: number;
  rewardCount?: number;
}

export interface PartnerWithPayoutAccounts extends PartnerProfileData {
  payoutAccounts: PartnerPayoutAccountData[];
  statusHistory: PartnerStatusHistoryData[];
}

export interface PartnerUserData {
  id: string;
  email?: string | null;
  phone?: string | null;
  firstName: string;
  lastName: string;
  status: string;
  clerkUserId?: string | null;
}

export interface PartnerPayoutAccountData {
  id: string;
  partnerId: string;
  accountName: string;
  accountNumber: string | null;
  bankName?: string | null;
  mpesaNumber?: string | null;
  isDefault: boolean;
}

export interface PartnerStatusHistoryData {
  id: string;
  oldStatus?: string | null;
  newStatus: string;
  reason?: string | null;
  changedAt: Date;
}

export interface PartnerSummary {
  id: string;
  partnerCode: string;
  companyName?: string | null;
  status: string;
  commissionRate: number;
}
