import { checkLimit, clientKey, limitMessage, type LimitKind } from "./ratelimit";

/**
 * The single gate in front of every paid AI call.
 *
 * Both checks happen before any Anthropic request is constructed, so a blocked
 * request costs nothing. Order matters: the kill switch is evaluated first and
 * without touching the network, so flipping it stops spend immediately even if
 * the rate-limit store is unreachable.
 */

/** True when the owner has paused all AI spend from the hosting dashboard. */
export function aiDisabled(): boolean {
  const v = (process.env.AI_DISABLED || "").trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "on";
}

export const PAUSED_MESSAGE =
  "AgentMint's AI is paused for a short while. Everything else still works — please check back soon.";

export type GuardResult =
  | { allowed: true }
  | { allowed: false; status: number; message: string; retryAfter: number };

export async function guardAI(req: Request, kind: LimitKind): Promise<GuardResult> {
  if (aiDisabled()) {
    return { allowed: false, status: 503, message: PAUSED_MESSAGE, retryAfter: 3600 };
  }

  const verdict = await checkLimit(kind, clientKey(req));
  if (!verdict.ok) {
    return {
      allowed: false,
      status: 429,
      message: limitMessage(verdict),
      retryAfter: verdict.retryAfter,
    };
  }

  return { allowed: true };
}

/** Standard headers so well-behaved clients back off on their own. */
export function retryHeaders(retryAfter: number): Record<string, string> {
  return { "Retry-After": String(Math.max(1, Math.round(retryAfter))) };
}

/**
 * Largest request body any AI route will accept.
 *
 * The per-field caps downstream only apply AFTER the body has been parsed, and
 * `req.json()` buffers the whole thing into memory first — so without this a
 * caller could post hundreds of megabytes and exhaust the function before a
 * single length check ran. The real worst case here is ~100KB (20 turns of
 * 4,000 chars plus a full config), so 256KB is generous.
 */
const MAX_BODY_BYTES = 256 * 1024;

export type BodyResult<T> =
  | { ok: true; body: T }
  | { ok: false; status: number; message: string };

/** Parse JSON with a hard size ceiling, refusing oversized bodies politely. */
export async function readJsonCapped<T>(req: Request): Promise<BodyResult<T>> {
  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > MAX_BODY_BYTES) {
    return {
      ok: false,
      status: 413,
      message: "That's a very large amount of text — please trim it and try again.",
    };
  }

  // Content-Length can be absent or wrong (chunked encoding), so measure the
  // bytes we actually received rather than trusting the header.
  let text: string;
  try {
    text = await req.text();
  } catch {
    return { ok: false, status: 400, message: "Couldn't read that request." };
  }
  if (text.length > MAX_BODY_BYTES) {
    return {
      ok: false,
      status: 413,
      message: "That's a very large amount of text — please trim it and try again.",
    };
  }

  try {
    return { ok: true, body: JSON.parse(text) as T };
  } catch {
    return { ok: false, status: 400, message: "Couldn't read that request." };
  }
}
