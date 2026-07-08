/**
 * Navigation types used across all portals.
 */

/** Single navigation item */
export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly icon?: string;
  readonly disabled?: boolean;
  readonly external?: boolean;
  readonly badge?: string;
}

/** Grouped set of navigation items with an optional heading */
export interface NavGroup {
  readonly title?: string;
  readonly items: readonly NavItem[];
}

/** Breadcrumb segment */
export interface Breadcrumb {
  readonly label: string;
  readonly href?: string;
  readonly isCurrent?: boolean;
}
