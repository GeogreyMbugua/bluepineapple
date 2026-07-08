import { prisma } from "../client";
import type { Role, Prisma } from "@prisma/client";

export class RoleRepository {
  /**
   * Find a role by its unique name.
   */
  async findByName(name: string): Promise<Role | null> {
    return prisma.role.findUnique({
      where: { name },
    });
  }

  /**
   * Find all roles in the system.
   */
  async findAll(): Promise<Role[]> {
    return prisma.role.findMany({
      orderBy: { name: "asc" },
    });
  }

  /**
   * Create a new role.
   */
  async create(data: Prisma.RoleCreateInput): Promise<Role> {
    return prisma.role.create({
      data,
    });
  }

  /**
   * Update an existing role.
   */
  async update(id: string, data: Prisma.RoleUpdateInput): Promise<Role> {
    return prisma.role.update({
      where: { id },
      data,
    });
  }
}

export const roleRepository = new RoleRepository();
