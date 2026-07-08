import type {
  DepartureStatus,
  VesselStatus,
  VesselType,
} from "@prisma/client";

export interface DepartureData {
  id: string;
  vesselId: string;
  routeId: string;
  experienceId: string;
  departureDateTime: Date;
  arrivalDateTime?: Date | null;
  totalCapacity: number;
  bookedSeats: number;
  availableCapacity: number;
  status: DepartureStatus;
  specialInstructions?: string | null;
  createdAt: Date;
  updatedAt: Date;
  vessel?: {
    id: string;
    name: string;
    capacity: number;
    status: VesselStatus;
    type?: VesselType | null;
  };
  route?: {
    id: string;
    name: string;
    code: string;
    stops: any[];
  };
  experience?: {
    id: string;
    name: string;
    slug: string;
    category: string;
  };
}

export interface DepartureWithDetails extends DepartureData {
  bookings: {
    id: string;
    status: DepartureStatus;
    totalGuests: number;
    partner: { id: string; partnerCode: string };
  }[];
}

export interface CreateDepartureInput {
  vesselId: string;
  routeId: string;
  experienceId: string;
  departureDateTime: Date;
  arrivalDateTime?: Date | null;
  totalCapacity: number;
  specialInstructions?: string | null;
}

export interface UpdateDepartureInput {
  vesselId?: string;
  routeId?: string;
  experienceId?: string;
  departureDateTime?: Date;
  arrivalDateTime?: Date | null;
  totalCapacity?: number;
  specialInstructions?: string | null;
}

export interface DepartureSearchInput {
  routeId?: string;
  vesselId?: string;
  experienceId?: string;
  status?: DepartureStatus;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}

export interface AssignVesselInput {
  vesselId: string;
}

export interface AssignRouteInput {
  routeId: string;
}

export interface AssignExperienceInput {
  experienceId: string;
}

export interface CapacityInfo {
  totalCapacity: number;
  bookedSeats: number;
  availableCapacity: number;
}
