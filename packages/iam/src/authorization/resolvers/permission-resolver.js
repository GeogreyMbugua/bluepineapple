import Redis from "ioredis";
import { userRepository } from "@blue-pineapple/database";
const PERMISSIONS_CACHE_PREFIX = "bp:permissions:";
let redisClient = null;
function getRedisUrl() {
    return process.env.REDIS_URL;
}
async function initRedis() {
    if (redisClient)
        return redisClient;
    const url = getRedisUrl();
    if (!url)
        return null;
    redisClient = new Redis(url, { lazyConnect: true });
    try {
        await redisClient.connect();
        return redisClient;
    }
    catch (error) {
        console.error("permission-resolver: redis connect failed", error);
        redisClient = null;
        return null;
    }
}
function permissionsCacheKey(userId) {
    return `${PERMISSIONS_CACHE_PREFIX}${userId}`;
}
export class PermissionResolver {
    async resolve(userId) {
        const cached = await this.getCachedPermissions(userId);
        if (cached)
            return cached;
        const user = await userRepository.findByIdWithRolesAndPermissions(userId);
        if (!user) {
            throw new Error(`User not found: ${userId}`);
        }
        const roles = user.roles;
        const permissions = user.permissions;
        const resolved = {
            roles,
            permissions,
        };
        await this.cachePermissions(userId, resolved);
        return resolved;
    }
    async getCachedPermissions(userId) {
        const redis = await initRedis();
        if (!redis)
            return null;
        const serialized = await redis.get(permissionsCacheKey(userId));
        if (!serialized)
            return null;
        try {
            return JSON.parse(serialized);
        }
        catch {
            return null;
        }
    }
    async invalidate(userId) {
        const redis = await initRedis();
        if (!redis)
            return;
        await redis.del(permissionsCacheKey(userId));
    }
    async cachePermissions(userId, value) {
        const redis = await initRedis();
        if (!redis)
            return;
        await redis.set(permissionsCacheKey(userId), JSON.stringify(value), "EX", 15 * 60);
    }
}
export const permissionResolver = new PermissionResolver();
