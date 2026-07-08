export interface RouteData {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  estimatedDurationMinutes?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RouteStopData {
  id: string;
  routeId: string;
  name: string;
  code?: string | null;
  sequence: number;
  latitude?: number | null;
  longitude?: number | null;
  isPickupPoint: boolean;
  isDropoffPoint: boolean;
  estimatedArrivalMinutes?: number | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RouteWithStops extends RouteData {
  stops: RouteStopData[];
}

export interface RouteWithDetails extends RouteData {
  stops: RouteStopData[];
  experienceRoutes: {
    id: string;
    isDefault: boolean;
    sortOrder: number;
    experience: {
      id: string;
      name: string;
      slug: string;
      category: string;
      defaultPrice: number;
    };
  }[];
}

export interface RouteListInput {
  page?: number;
  limit?: number;
  search?: string;
  activeOnly?: boolean;
}

export interface AssignStopInput {
  name: string;
  code?: string | null;
  sequence: number;
  latitude?: number | null;
  longitude?: number | null;
  isPickupPoint?: boolean;
  isDropoffPoint?: boolean;
  estimatedArrivalMinutes?: number | null;
  notes?: string | null;
}

export interface ReorderStopInput {
  oldSequence: number;
  newSequence: number;
}
