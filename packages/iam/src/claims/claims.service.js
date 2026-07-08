import Redis from "ioredis";
import { claimsBuilder } from "./claims-builder";
const CLAIMS_CACHE_PREFIX = "bp:claims:";
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
        console.error("claims-service: redis connect failed", error);
        redisClient = null;
        return null;
    }
}
function claimsCacheKey(userId) {
    return `${CLAIMS_CACHE_PREFIX}${userId}`;
}
export class ClaimsService {
    async buildClaims(userId, sessionId) {
        const claims = await claimsBuilder.build(userId, sessionId);
        await this.cacheClaims(userId, claims);
        return claims;
    }
    async refreshClaims(userId, sessionId) {
        await this.invalidateClaims(userId);
        return this.buildClaims(userId, sessionId);
    }
    async invalidateClaims(userId) {
        const redis = await initRedis();
        if (!redis)
            return;
        await redis.del(claimsCacheKey(userId));
    }
    async getCachedClaims(userId) {
        const redis = await initRedis();
        if (!redis)
            return null;
        const cached = await redis.get(claimsCacheKey(userId));
        if (!cached)
            return null;
        try {
            return JSON.parse(cached);
        }
        catch {
            return null;
        }
    }
    async cacheClaims(userId, claims) {
        const redis = await initRedis();
        if (!redis)
            return;
        await redis.set(claimsCacheKey(userId), JSON.stringify(claims), "EX", 15 * 60);
    }
}
export const claimsService = new ClaimsService();
