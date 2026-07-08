export interface PartnerCreatedEvent {
  partnerId: string;
  userId: string;
  partnerCode: string;
}

export interface PartnerActivatedEvent {
  partnerId: string;
  userId: string;
}

export interface PartnerSuspendedEvent {
  partnerId: string;
  userId: string;
  reason?: string;
}

export interface PartnerTerminatedEvent {
  partnerId: string;
  userId: string;
  reason?: string;
}

export interface PayoutAccountAddedEvent {
  partnerId: string;
  accountId: string;
}

export interface PayoutAccountRemovedEvent {
  partnerId: string;
  accountId: string;
}
