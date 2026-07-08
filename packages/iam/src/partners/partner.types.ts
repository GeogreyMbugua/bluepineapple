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
}

export interface PartnerWithPayoutAccounts extends PartnerProfileData {
  payoutAccounts: PartnerPayoutAccountData[];
  statusHistory: PartnerStatusHistoryData[];
}

export interface PartnerPayoutAccountData {
  id: string;
  partnerId: string;
  accountName: string;
  accountNumber: string;
  bankName?: string | null;
  mpesaNumber?: string | null;
  isDefault: boolean;
}

export interface PartnerStatusHistoryData {
  id: string;
  oldStatus: string;
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
