export interface RouteCreatedEvent {
  routeId: string;
  routeCode: string;
  routeName: string;
}

export interface RouteUpdatedEvent {
  routeId: string;
  routeCode: string;
}

export interface RouteArchivedEvent {
  routeId: string;
  routeCode: string;
}

export interface StopAssignedEvent {
  routeId: string;
  stopId: string;
  stopName: string;
  sequence: number;
}

export interface StopReorderedEvent {
  routeId: string;
  oldSequence: number;
  newSequence: number;
}
