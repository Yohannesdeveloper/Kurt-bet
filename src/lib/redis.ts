import { Redis as UpstashRedis } from "@upstash/redis";
import IORedis from "ioredis";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL || "";
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const REDIS_URL = process.env.REDIS_URL || "";

type Client = UpstashRedis | IORedis;
let client: Client | null = null;

function isUpstash(url: string): boolean {
  return url.startsWith("https://") || url.startsWith("http://");
}

function initClient(): Client | null {
  if (UPSTASH_URL && UPSTASH_TOKEN && isUpstash(UPSTASH_URL)) {
    try {
      return new UpstashRedis({ url: UPSTASH_URL, token: UPSTASH_TOKEN });
    } catch { /* fall through */ }
  }

  if (REDIS_URL) {
    try {
      const io = new IORedis(REDIS_URL, {
        maxRetriesPerRequest: 1,
        retryStrategy() { return null; },
        lazyConnect: true,
      });
      io.connect().catch(() => {});
      return io;
    } catch { /* fall through */ }
  }

  return null;
}

function getClient(): Client | null {
  if (!client) client = initClient();
  return client;
}

const DEFAULT_TTL = 60;

export async function cacheGet<T>(key: string): Promise<T | null> {
  const c = getClient();
  if (!c) return null;
  try {
    if (c instanceof UpstashRedis) {
      return (await c.get<T>(key)) ?? null;
    }
    const raw = await (c as IORedis).get(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch { return null; }
}

export async function cacheSet(key: string, value: unknown, ttl = DEFAULT_TTL): Promise<void> {
  const c = getClient();
  if (!c) return;
  try {
    if (c instanceof UpstashRedis) {
      if (ttl > 0) {
        await c.set(key, value, { ex: ttl });
      } else {
        await c.set(key, value);
      }
    } else {
      if (ttl > 0) {
        await (c as IORedis).setex(key, ttl, JSON.stringify(value));
      } else {
        await (c as IORedis).set(key, JSON.stringify(value));
      }
    }
  } catch { /* silent */ }
}

export async function cacheDel(key: string): Promise<void> {
  const c = getClient();
  if (!c) return;
  try {
    if (c instanceof UpstashRedis) {
      await c.del(key);
    } else {
      await (c as IORedis).del(key);
    }
  } catch { /* silent */ }
}

export async function cacheDelPattern(_pattern: string): Promise<void> {
  // KEYS command not supported by Upstash Redis REST API.
  // Use direct key deletion instead — pattern-based not needed.
}
