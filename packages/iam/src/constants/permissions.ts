import { PERMISSIONS } from "@blue-pineapple/shared/rbac";

export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_GROUPS = {
  users: PERMISSIONS.filter((p) => p.startsWith("user.")),
  partners: PERMISSIONS.filter((p) => p.startsWith("partner.")),
  bookings: PERMISSIONS.filter((p) => p.startsWith("booking.")),
  experiences: PERMISSIONS.filter((p) => p.startsWith("experience.")),
  rewards: PERMISSIONS.filter((p) => p.startsWith("reward.")),
  payments: PERMISSIONS.filter((p) => p.startsWith("payment.")),
  properties: PERMISSIONS.filter((p) => p.startsWith("property.")),
  investments: PERMISSIONS.filter((p) => p.startsWith("investment.")),
} as const;

export function getAllPermissions(): Permission[] {
  return [...PERMISSIONS];
}

export function getPermissionsByGroup(group: keyof typeof PERMISSION_GROUPS): Permission[] {
  return [...PERMISSION_GROUPS[group]];
}
