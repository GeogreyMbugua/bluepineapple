import { prisma } from "../client";
export class PermissionRepository {
    /**
     * Find a permission by its unique key.
     */
    async findByKey(key) {
        return prisma.permission.findUnique({
            where: { key },
        });
    }
    /**
     * Find all permissions in the system.
     */
    async findAll() {
        return prisma.permission.findMany({
            orderBy: { key: "asc" },
        });
    }
    /**
     * Create a new permission.
     */
    async create(data) {
        return prisma.permission.create({
            data,
        });
    }
}
export const permissionRepository = new PermissionRepository();
