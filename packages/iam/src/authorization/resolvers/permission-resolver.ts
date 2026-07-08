import Redis from "ioredis";
import { userRepository } from "@blue-pineapple/database";
import type { Permission } from "../../types/permissions";
import type { Role } from "../../types/roles";

const PERMISSIONS_CACHE_PREFIX = "bp:permissions:";
let redisClient: Redis | null = null;

function getRedisUrl(): string | undefined {
  return process.env.REDIS_URL;
}

async function initRedis(): Promise<Redis | null> {
  if (redisClient) return redisClient;
  const url = getRedisUrl();
  if (!url) return null;
  redisClient = new Redis(url, { lazyConnect: true });
  try {
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error("permission-resolver: redis connect failed", error);
    redisClient = null;
    return null;
  }
}

function permissionsCacheKey(userId: string): string {
  return `${PERMISSIONS_CACHE_PREFIX}${userId}`;
}

export interface PermissionResolution {
  roles: Role[];
  permissions: Permission[];
}

export class PermissionResolver {
  async resolve(userId: string): Promise<PermissionResolution> {
    const cached = await this.getCachedPermissions(userId);
    if (cached) return cached;

    const user = await userRepository.findByIdWithRolesAndPermissions(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const roles = user.roles as Role[];
    const permissions = user.permissions as Permission[];
    const resolved: PermissionResolution = {
      roles,
      permissions,
    };

    await this.cachePermissions(userId, resolved);
    return resolved;
  }

  async getCachedPermissions(userId: string): Promise<PermissionResolution | null> {
    const redis = await initRedis();
    if (!redis) return null;
    const serialized = await redis.get(permissionsCacheKey(userId));
    if (!serialized) return null;

    try {
      return JSON.parse(serialized) as PermissionResolution;
    } catch {
      return null;
    }
  }

  async invalidate(userId: string): Promise<void> {
    const redis = await initRedis();
    if (!redis) return;
    await redis.del(permissionsCacheKey(userId));
  }

  private async cachePermissions(userId: string, value: PermissionResolution): Promise<void> {
    const redis = await initRedis();
    if (!redis) return;
    await redis.set(permissionsCacheKey(userId), JSON.stringify(value), "EX", 15 * 60);
  }
}

export const permissionResolver = new PermissionResolver();
