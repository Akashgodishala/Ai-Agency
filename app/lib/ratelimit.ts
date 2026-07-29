/**
 * ============================================================================
 * Rate limiting that survives serverless.
 * ============================================================================
 *
 * Every AI endpoint spends the owner's Anthropic credits, and there are no user
 * accounts — anyone on the internet can trigger a paid call. This module is the
 * meter in front of that.
 *
 * WHY NOT AN IN-MEMORY MAP: Vercel runs many function instances concurrently
 * and recycles them constantly. A per-instance Map means the real limit is
 * "N per minute, times however many instances happen to be warm" — which is
 * unbounded in exactly the situation you'd want a limit. So counters live in
 * Upstash Redis over its REST API (HTTP, no TCP connection to hold open, which
 * is what serverless needs).
 *
 * WHEN UPSTASH ISN'T CONFIGURED, or is down, we fall back to the in-memory
 * counters. That is weaker, not nothing: it still stops a single instance being
 * hammered, and it degrades rather than locking out real visitors. The status
 * endpoint reports which mode is live so the gap is never silent.
 *
 * Three independent limits, all of which must pass:
 *   1. per IP per minute  — stops bursts
 *   2. per IP per day     — stops a slow drip from one source
 *   3. GLOBAL per day     — the real credit ceiling. Caps total spend even if
 *                           the traffic is spread across thousands of IPs,
 *                           which per-IP limits alone cannot do.
 */

export type LimitKind = "chat" | "generate" | "refine";

export interface LimitVerdict {
  ok: boolean;
  /** Which ceiling was hit — drives the wording the visitor sees. */
  reason?: "minute" | "day" | "global";
  /** Seconds until it's worth trying again. */
  retryAfter: number;
}

/**
 * Tuned for "a real person testing agents", not for load. A visitor kicking the
 * tyres sends a handful of messages a minute; 12 is generous for that and still
 * bounds a single IP to a small, known daily spend.
 */
const RULES: Record<LimitKind, { perMinute: number; perDay: number }> = {
  chat: { perMinute: 12, perDay: 200 },
  generate: { perMinute: 4, perDay: 25 },
  refine: { perMinute: 8, perDay: 60 },
};

/** Total AI calls served per day across everyone. The hard credit ceiling. */
const GLOBAL_DAILY_CAP = Number(process.env.AI_GLOBAL_DAILY_CAP || 2000);

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export function limiterBackend(): "redis" | "memory" {
  return UPSTASH_URL && UPSTASH_TOKEN ? "redis" : "memory";
}

// ---------------------------------------------------------------------------
// Client identity
// ---------------------------------------------------------------------------

/**
 * Vercel overwrites `x-forwarded-for` with the real client IP and explicitly
 * does not forward externally-supplied values ("to prevent IP spoofing"), so
 * it cannot be forged by the caller. `x-vercel-forwarded-for` is the same value
 * but also survives a proxy sitting in front of Vercel, so prefer it.
 */
export function clientKey(req: Request): string {
  const h = req.headers;
  const raw =
    h.get("x-vercel-forwarded-for") ||
    h.get("x-real-ip") ||
    h.get("x-forwarded-for") ||
    "";
  const first = raw.split(",")[0].trim();
  return first || "local";
}

// ---------------------------------------------------------------------------
// Fallback: in-memory fixed windows (per instance — best effort only)
// ---------------------------------------------------------------------------

const buckets = new Map<string, { count: number; resetAt: number }>();
const MAX_BUCKETS = 10_000;

function memoryHit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    if (buckets.size >= MAX_BUCKETS) {
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

// ---------------------------------------------------------------------------
// Upstash Redis over REST
// ---------------------------------------------------------------------------

/**
 * INCR the key and set its TTL on first write.
 *
 * INCR is atomic, which is what makes this correct across concurrent instances:
 * two functions incrementing at the same instant get 1 and 2, never 1 and 1.
 * EXPIRE carries NX so a later call in the same window can't extend the window.
 *
 * Returns the post-increment count, or null if Redis is unreachable — callers
 * treat null as "fall back to memory", never as "allow".
 */
async function redisIncr(key: string, ttlSeconds: number): Promise<number | null> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  try {
    const res = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(ttlSeconds), "NX"],
      ]),
      // A limiter must never become the slowest thing in the request. If Redis
      // can't answer quickly, degrade to memory rather than stall the visitor.
      signal: AbortSignal.timeout(2000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as unknown;
    if (!Array.isArray(body) || body.length === 0) return null;
    const first = body[0] as { result?: unknown; error?: unknown };
    if (first?.error) return null;
    const n = Number(first?.result);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** UTC day stamp, so the daily window is the same for every instance. */
function dayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Seconds left in the current UTC day — the daily keys' TTL. */
function secondsUntilUtcMidnight(): number {
  const now = new Date();
  const midnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1
  );
  return Math.max(60, Math.ceil((midnight - now.getTime()) / 1000));
}

// ---------------------------------------------------------------------------
// The check
// ---------------------------------------------------------------------------

/**
 * Consume one unit of quota. Call this exactly once per request, BEFORE any
 * model call — a request that is going to be refused must never reach Anthropic.
 */
export async function checkLimit(kind: LimitKind, ip: string): Promise<LimitVerdict> {
  const rule = RULES[kind];
  const day = dayStamp();
  const minuteWindow = Math.floor(Date.now() / 60_000);
  const dayTtl = secondsUntilUtcMidnight();

  if (limiterBackend() === "redis") {
    const [minute, daily, global] = await Promise.all([
      redisIncr(`rl:${kind}:${ip}:m:${minuteWindow}`, 70),
      redisIncr(`rl:${kind}:${ip}:d:${day}`, dayTtl),
      redisIncr(`rl:global:d:${day}`, dayTtl),
    ]);

    // Any null means Redis didn't answer — drop to the in-memory limiter for
    // this request rather than letting it through unmetered.
    if (minute !== null && daily !== null && global !== null) {
      if (global > GLOBAL_DAILY_CAP) return { ok: false, reason: "global", retryAfter: dayTtl };
      if (daily > rule.perDay) return { ok: false, reason: "day", retryAfter: dayTtl };
      if (minute > rule.perMinute) return { ok: false, reason: "minute", retryAfter: 60 };
      return { ok: true, retryAfter: 0 };
    }
  }

  // ---- fallback ----
  if (!memoryHit(`g:${kind}:${ip}:m`, rule.perMinute, 60_000)) {
    return { ok: false, reason: "minute", retryAfter: 60 };
  }
  if (!memoryHit(`g:${kind}:${ip}:d`, rule.perDay, 86_400_000)) {
    return { ok: false, reason: "day", retryAfter: dayTtl };
  }
  if (!memoryHit(`g:all:d`, GLOBAL_DAILY_CAP, 86_400_000)) {
    return { ok: false, reason: "global", retryAfter: dayTtl };
  }
  return { ok: true, retryAfter: 0 };
}

/** What the visitor reads. Never a status code, never the word "rate limit". */
export function limitMessage(v: LimitVerdict): string {
  switch (v.reason) {
    case "minute":
      return "That's a lot of messages at once — give it about a minute, then carry on.";
    case "day":
      return "You've reached today's free testing limit. It resets tomorrow — thanks for giving it such a thorough try.";
    case "global":
      return "AgentMint is unusually busy right now and free testing is paused for a bit. Please try again later.";
    default:
      return "Just a moment — please try that again shortly.";
  }
}
