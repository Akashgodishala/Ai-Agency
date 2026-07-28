import { NextResponse } from "next/server";
import type { RefineRequest, RefineResponse } from "@/lib/types";
import { isLive, demoRefine } from "@/lib/engine";
import { liveRefine } from "@/lib/anthropic";
import { normalizeConfig } from "@/lib/validate";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<NextResponse<RefineResponse>> {
  if (!rateLimit(`refine:${clientKey(req)}`, 20, 60_000)) {
    return NextResponse.json(
      { engine: "demo", config: null as never, changed: "", error: "Too many changes at once — give it a minute." },
      { status: 429 }
    );
  }

  let body: RefineRequest;
  try {
    body = (await req.json()) as RefineRequest;
  } catch {
    return NextResponse.json(
      { engine: "demo", config: null as never, changed: "", error: "Invalid request." },
      { status: 400 }
    );
  }

  const config = normalizeConfig(body.config);
  const instruction = (body.instruction ?? "").trim().slice(0, 1000);
  if (!config || !instruction) {
    return NextResponse.json(
      { engine: "demo", config: null as never, changed: "", error: "Tell the agent how to change." },
      { status: 400 }
    );
  }

  if (isLive()) {
    try {
      const result = await liveRefine(config, instruction);
      return NextResponse.json({ engine: "live", config: result.config, changed: result.changed });
    } catch (err) {
      console.error("liveRefine failed, degrading to demo:", err);
    }
  }

  const result = demoRefine(config, instruction);
  return NextResponse.json({ engine: "demo", config: result.config, changed: result.changed });
}
