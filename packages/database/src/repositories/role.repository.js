import { prisma } from "../client";
export class RoleRepository {
    /**
     * Find a role by its unique name.
     */
    async findByName(name) {
        return prisma.role.findUnique({
            where: { name },
        });
    }
    /**
     * Find all roles in the system.
     */
    async findAll() {
        return prisma.role.findMany({
            orderBy: { name: "asc" },
        });
    }
    /**
     * Create a new role.
     */
    async create(data) {
        return prisma.role.create({
            data,
        });
    }
    /**
     * Update an existing role.
     */
    async update(id, data) {
        return prisma.role.update({
            where: { id },
            data,
        });
    }
}
export const roleRepository = new RoleRepository();
