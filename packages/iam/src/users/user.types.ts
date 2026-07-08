import type { UserStatus } from "@prisma/client";
import type { Role } from "../types/roles";
import type { Permission } from "../types/permissions";

export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
}

export interface UserLifecyclePayload {
  id: string;
  status: UserStatus;
  emailVerifiedAt?: string | null;
  phoneVerifiedAt?: string | null;
  roles: Role[];
  permissions: Permission[];
}
