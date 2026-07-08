export interface ExperienceData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  durationMinutes?: number | null;
  defaultPrice?: string | null;
  currency: string;
  category: string;
  isFeatured: boolean;
  isActive: boolean;
  heroImageUrl?: string | null;
  galleryUrls: string[];
  maxGroupSize?: number | null;
  minGroupSize?: number | null;
  requirements: string[];
  includes: string[];
  highlights: string[];
  meta?: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExperienceRouteData {
  id: string;
  experienceId: string;
  routeId: string;
  isDefault: boolean;
  sortOrder: number;
}

export interface ExperienceWithRoutes extends ExperienceData {
  experienceRoutes: ExperienceRouteData[];
  routes: { id: string; name: string; code: string }[];
}
