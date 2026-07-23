type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const globalStore = globalThis as typeof globalThis & {
  ministryRateLimits?: Map<string, Bucket>;
};

const buckets = globalStore.ministryRateLimits ?? new Map<string, Bucket>();
globalStore.ministryRateLimits = buckets;

function clientAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return request.headers.get("x-vercel-forwarded-for")
    || forwarded?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

export function checkRateLimit(request: Request, options: RateLimitOptions) {
  const now = Date.now();
  const id = `${options.key}:${clientAddress(request)}`;
  const current = buckets.get(id);

  if (!current || current.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= options.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
