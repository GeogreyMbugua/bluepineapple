import { getRedisClient } from "../auth/session-cache.service";
const RATE_LIMIT_PREFIX = "bp:ratelimit:";
export class RateLimiter {
    async check(key, config) {
        const redis = getRedisClient();
        if (!redis) {
            return { allowed: true, remaining: config.limit, resetAt: null };
        }
        const fullKey = `${RATE_LIMIT_PREFIX}${key}`;
        const windowSeconds = Math.ceil(config.windowMs / 1000);
        const now = Math.floor(Date.now() / 1000);
        try {
            const count = await redis.incr(fullKey);
            if (count === 1) {
                await redis.expire(fullKey, windowSeconds);
            }
            const ttl = await redis.ttl(fullKey);
            const resetAt = ttl > 0 ? new Date(Date.now() + ttl * 1000).toISOString() : null;
            const remaining = Math.max(0, config.limit - count);
            return {
                allowed: count <= config.limit,
                remaining,
                resetAt,
            };
        }
        catch {
            return { allowed: true, remaining: config.limit, resetAt: null };
        }
    }
}
export const rateLimiter = new RateLimiter();
export const OtpRateLimiter = {
    key: (identifier) => `otp:${identifier}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
};
