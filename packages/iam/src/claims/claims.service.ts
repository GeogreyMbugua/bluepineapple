import type { JwtClaims } from "./claims.types";
import Redis from "ioredis";
import { claimsBuilder } from "./claims-builder";

const CLAIMS_CACHE_PREFIX = "bp:claims:";
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
    console.error("claims-service: redis connect failed", error);
    redisClient = null;
    return null;
  }
}

function claimsCacheKey(userId: string): string {
  return `${CLAIMS_CACHE_PREFIX}${userId}`;
}

export class ClaimsService {
  async buildClaims(userId: string, sessionId: string): Promise<JwtClaims> {
    const claims = await claimsBuilder.build(userId, sessionId);
    await this.cacheClaims(userId, claims);
    return claims;
  }

  async refreshClaims(userId: string, sessionId: string): Promise<JwtClaims> {
    await this.invalidateClaims(userId);
    return this.buildClaims(userId, sessionId);
  }

  async invalidateClaims(userId: string): Promise<void> {
    const redis = await initRedis();
    if (!redis) return;
    await redis.del(claimsCacheKey(userId));
  }

  async getCachedClaims(userId: string): Promise<JwtClaims | null> {
    const redis = await initRedis();
    if (!redis) return null;
    const cached = await redis.get(claimsCacheKey(userId));
    if (!cached) return null;
    try {
      return JSON.parse(cached) as JwtClaims;
    } catch {
      return null;
    }
  }

  private async cacheClaims(userId: string, claims: JwtClaims): Promise<void> {
    const redis = await initRedis();
    if (!redis) return;
    await redis.set(claimsCacheKey(userId), JSON.stringify(claims), "EX", 15 * 60);
  }
}

export const claimsService = new ClaimsService();
