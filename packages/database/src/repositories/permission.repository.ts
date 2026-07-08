import { prisma } from "../client";
import type { Permission, Prisma } from "@prisma/client";

export class PermissionRepository {
  /**
   * Find a permission by its unique key.
   */
  async findByKey(key: string): Promise<Permission | null> {
    return prisma.permission.findUnique({
      where: { key },
    });
  }

  /**
   * Find all permissions in the system.
   */
  async findAll(): Promise<Permission[]> {
    return prisma.permission.findMany({
      orderBy: { key: "asc" },
    });
  }

  /**
   * Create a new permission.
   */
  async create(data: Prisma.PermissionCreateInput): Promise<Permission> {
    return prisma.permission.create({
      data,
    });
  }
}

export const permissionRepository = new PermissionRepository();
