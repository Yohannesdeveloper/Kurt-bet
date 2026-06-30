import { Redis } from "@upstash/redis";

const REDIS_URL = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const REDIS_TOKEN = process.env.REDIS_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

let redis: Redis | null = null;

if (REDIS_URL && REDIS_TOKEN) {
  try {
    redis = new Redis({ url: REDIS_URL, token: REDIS_TOKEN });
  } catch {
    redis = null;
  }
}

export const kv = redis;

const DEFAULT_TTL = 60;

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!kv) return null;
  try {
    const data = await kv.get<T>(key);
    return data ?? null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttl = DEFAULT_TTL): Promise<void> {
  if (!kv) return;
  try {
    await kv.set(key, value, { ex: ttl });
  } catch {
    // silent
  }
}

export async function cacheDel(key: string): Promise<void> {
  if (!kv) return;
  try {
    await kv.del(key);
  } catch {
    // silent
  }
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  if (!kv) return;
  try {
    const keys = await kv.keys(pattern);
    if (keys.length > 0) await kv.del(...keys);
  } catch {
    // silent
  }
}
