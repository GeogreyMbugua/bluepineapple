export interface CustomerCreatedEvent {
  customerId: string;
  customerNumber?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  source?: string;
}

export interface CustomerUpdatedEvent {
  customerId: string;
  changedFields: string[];
}

export interface CustomerStatusChangedEvent {
  customerId: string;
  oldStatus: string;
  newStatus: string;
  reason?: string;
}

export interface CustomerContactAddedEvent {
  customerId: string;
  contactId: string;
  type: string;
  value: string;
}

export interface CustomerContactRemovedEvent {
  customerId: string;
  contactId: string;
}

export interface CustomerAddressAddedEvent {
  customerId: string;
  addressId: string;
  type: string;
}

export interface CustomerSegmentAssignedEvent {
  customerId: string;
  segmentId: string;
  segmentCode: string;
}

export interface CustomerSegmentRemovedEvent {
  customerId: string;
  segmentId: string;
}

export interface CustomerTagAddedEvent {
  customerId: string;
  tag: string;
}

export interface CustomerTagRemovedEvent {
  customerId: string;
  tag: string;
}

export interface CustomerPreferenceUpdatedEvent {
  customerId: string;
  category: string;
  key: string;
}

export interface CustomerTimelineEvent {
  timelineId: string;
  customerId: string;
  eventType: string;
  description: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export interface CustomerInteractionCreatedEvent {
  interactionId: string;
  customerId: string;
  type: string;
  direction: string;
}

export interface CustomerConsentUpdatedEvent {
  customerId: string;
  channel: string;
  consentType: string;
  isGranted: boolean;
}

export interface CustomerRelationshipCreatedEvent {
  relationshipId: string;
  customerId: string;
  relatedCustomerId: string;
  type: string;
}

export interface CustomerDocumentUploadedEvent {
  documentId: string;
  customerId: string;
  documentType: string;
  status: string;
}

export interface LoyaltyTierChangedEvent {
  customerId: string;
  oldTierId?: string;
  newTierId: string;
  newTierCode: string;
  newTierLevel: number;
}

export interface LoyaltyPointsUpdatedEvent {
  customerId: string;
  pointsEarned: number;
  pointsRedeemed: number;
  newBalance: number;
}

export interface CustomerMergedEvent {
  sourceCustomerId: string;
  targetCustomerId: string;
}

export interface CustomerIntelligenceUpdatedEvent {
  customerId: string;
  lifetimeValue: number;
  totalBookings: number;
  totalTripsCompleted: number;
}
