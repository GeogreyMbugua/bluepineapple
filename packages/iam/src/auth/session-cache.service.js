import Redis from "ioredis";
import { SESSION_CACHE_KEY_PREFIX } from "./session.types";
let redisClient = null;
function getRedisUrl() {
    return process.env.REDIS_URL;
}
export async function initRedis() {
    const url = getRedisUrl();
    if (!url)
        return;
    if (!redisClient) {
        redisClient = new Redis(url, { lazyConnect: true });
        try {
            await redisClient.connect();
        }
        catch (err) {
            console.error("session-cache: failed to connect to redis", err);
            redisClient = null;
        }
    }
}
function redisKey(sessionId) {
    return `${SESSION_CACHE_KEY_PREFIX}${sessionId}`;
}
export async function getSession(sessionId) {
    try {
        if (!redisClient)
            await initRedis();
        if (!redisClient)
            return null;
        const v = await redisClient.get(redisKey(sessionId));
        if (!v)
            return null;
        return JSON.parse(v);
    }
    catch (err) {
        console.warn("session-cache: getSession failed", err);
        return null;
    }
}
export async function setSession(sessionId, data, ttlSeconds) {
    try {
        if (!redisClient)
            await initRedis();
        if (!redisClient)
            return;
        const key = redisKey(sessionId);
        const payload = JSON.stringify(data);
        if (ttlSeconds > 0) {
            await redisClient.set(key, payload, "EX", ttlSeconds);
        }
        else {
            await redisClient.set(key, payload);
        }
    }
    catch (err) {
        console.warn("session-cache: setSession failed", err);
    }
}
export async function deleteSession(sessionId) {
    try {
        if (!redisClient)
            await initRedis();
        if (!redisClient)
            return;
        await redisClient.del(redisKey(sessionId));
    }
    catch (err) {
        console.warn("session-cache: deleteSession failed", err);
    }
}
export function getRedisClient() {
    return redisClient;
}
