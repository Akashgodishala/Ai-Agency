import { NextResponse } from "next/server";
import { isLive } from "@/lib/engine";
import { aiDisabled } from "@/lib/ai-guard";
import { limiterBackend } from "@/lib/ratelimit";

export const runtime = "nodejs";
// Never prerender this: the answer depends on the runtime environment, and a
// build-time snapshot would permanently report "demo" even with a key present.
export const dynamic = "force-dynamic";

/**
 * Lets the UI know which engine will answer BEFORE the first message is sent,
 * so demo mode is labeled up front — never only after the fact.
 *
 * Also reports whether AI is paused, so the playground can say so calmly
 * instead of letting the visitor discover it by sending a message that fails.
 * `limiter` is for the owner's own diagnostics — it says whether rate limits
 * are shared across serverless instances or only best-effort per instance.
 */
export async function GET() {
  const paused = aiDisabled();
  return NextResponse.json({
    engine: paused ? "paused" : isLive() ? "live" : "demo",
    paused,
    limiter: limiterBackend(),
  });
}
