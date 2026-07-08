import { PERMISSIONS } from "@blue-pineapple/shared/rbac";

export { PERMISSIONS } from "@blue-pineapple/shared/rbac";
export type { Permission } from "@blue-pineapple/shared/rbac";

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

export function getAllPermissions(): readonly string[] {
  return PERMISSIONS;
}

export function getPermissionsByCategory(category: keyof typeof PERMISSION_GROUPS): readonly string[] {
  return PERMISSION_GROUPS[category];
}
