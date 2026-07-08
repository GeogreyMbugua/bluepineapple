import type { AuthUser } from "../types/auth-user";
import { userRepository } from "@blue-pineapple/database";

export class CurrentUserService {
  async getById(userId: string): Promise<AuthUser | null> {
    const user = await userRepository.findByIdWithRolesAndPermissions(userId);
    if (!user) return null;

    return {
      id: user.id,
      email: user.email ?? null,
      phone: user.phone ?? null,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      status: user.status,
      roles: user.roles as any,
      permissions: user.permissions as any,
    };
  }

  async getByEmail(email: string): Promise<AuthUser | null> {
    const user = await userRepository.findByEmail(email);
    if (!user) return null;

    const full = await userRepository.findByIdWithRolesAndPermissions(user.id);
    if (!full) return null;

    return {
      id: full.id,
      email: full.email ?? null,
      phone: full.phone ?? null,
      firstName: full.firstName ?? null,
      lastName: full.lastName ?? null,
      status: full.status,
      roles: full.roles as any,
      permissions: full.permissions as any,
    };
  }

  async getByPhone(phone: string): Promise<AuthUser | null> {
    const user = await userRepository.findByPhone(phone);
    if (!user) return null;

    const full = await userRepository.findByIdWithRolesAndPermissions(user.id);
    if (!full) return null;

    return {
      id: full.id,
      email: full.email ?? null,
      phone: full.phone ?? null,
      firstName: full.firstName ?? null,
      lastName: full.lastName ?? null,
      status: full.status,
      roles: full.roles as any,
      permissions: full.permissions as any,
    };
  }

  async isActive(userId: string): Promise<boolean> {
    const user = await userRepository.findById(userId);
    return user?.status === "ACTIVE";
  }
}

export const currentUserService = new CurrentUserService();
