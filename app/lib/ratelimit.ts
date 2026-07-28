/**
 * Minimal in-memory rate limiter (fixed window, per key).
 * Best-effort: on serverless each instance keeps its own map, and restarts
 * reset counts. That's an accepted v1 limitation — it still stops casual
 * abuse of the API key relay. Replace with a shared store (e.g. Upstash)
 * when the platform gets accounts.
 */

const buckets = new Map<string, { count: number; resetAt: number }>();
const MAX_BUCKETS = 10_000;

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    if (buckets.size >= MAX_BUCKETS) {
      // Cheap pruning: drop expired entries; if none expired, reject writes
      // rather than growing unboundedly.
      for (const [k, v] of buckets) if (now >= v.resetAt) buckets.delete(k);
      if (buckets.size >= MAX_BUCKETS) return false;
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}

/** Extract a best-effort client key from a request. */
export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0].trim() : "") || "local";
}
