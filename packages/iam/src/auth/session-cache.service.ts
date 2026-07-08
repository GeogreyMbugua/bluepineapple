import Redis from "ioredis";
import { SESSION_CACHE_KEY_PREFIX, SessionData } from "./session.types";

let redisClient: Redis | null = null;

function getRedisUrl(): string | undefined {
  return process.env.REDIS_URL;
}

export async function initRedis(): Promise<void> {
  const url = getRedisUrl();
  if (!url) return;
  if (!redisClient) {
    redisClient = new Redis(url, { lazyConnect: true });
    try {
      await redisClient.connect();
    } catch (err) {
      console.error("session-cache: failed to connect to redis", err);
      redisClient = null;
    }
  }
}

function redisKey(sessionId: string) {
  return `${SESSION_CACHE_KEY_PREFIX}${sessionId}`;
}

export async function getSession(sessionId: string): Promise<SessionData | null> {
  try {
    if (!redisClient) await initRedis();
    if (!redisClient) return null;
    const v = await redisClient.get(redisKey(sessionId));
    if (!v) return null;
    return JSON.parse(v) as SessionData;
  } catch (err) {
    console.warn("session-cache: getSession failed", err);
    return null;
  }
}

export async function setSession(
  sessionId: string,
  data: SessionData,
  ttlSeconds: number
): Promise<void> {
  try {
    if (!redisClient) await initRedis();
    if (!redisClient) return;
    const key = redisKey(sessionId);
    const payload = JSON.stringify(data);
    if (ttlSeconds > 0) {
      await redisClient.set(key, payload, "EX", ttlSeconds);
    } else {
      await redisClient.set(key, payload);
    }
  } catch (err) {
    console.warn("session-cache: setSession failed", err);
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    if (!redisClient) await initRedis();
    if (!redisClient) return;
    await redisClient.del(redisKey(sessionId));
  } catch (err) {
    console.warn("session-cache: deleteSession failed", err);
  }
}

export function getRedisClient(): Redis | null {
  return redisClient;
}

