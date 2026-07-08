export interface GuestCreatedEvent {
  guestId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export interface GuestUpdatedEvent {
  guestId: string;
}

export interface GuestMergedEvent {
  guestId: string;
  mergedWithId: string;
}
