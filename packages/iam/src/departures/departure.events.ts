export interface DepartureCreatedEvent {
  departureId: string;
  experienceId: string;
  routeId: string;
  vesselId: string;
  departureDateTime: string;
}

export interface DeparturePublishedEvent {
  departureId: string;
}

export interface DepartureCancelledEvent {
  departureId: string;
}

export interface DepartureRescheduledEvent {
  departureId: string;
  oldDateTime: string;
  newDateTime: string;
}

export interface DepartureClosedEvent {
  departureId: string;
}

export interface DepartureAssignedEvent {
  departureId: string;
  vesselId?: string;
  routeId?: string;
  experienceId?: string;
}

export interface DepartureUpdatedEvent {
  departureId: string;
}
