import { NextResponse } from "next/server";
import type { RefineRequest, RefineResponse } from "@/lib/types";
import { isLive, demoRefine } from "@/lib/engine";
import { liveRefine } from "@/lib/anthropic";
import { normalizeConfig } from "@/lib/validate";
import { guardAI, retryHeaders, readJsonCapped } from "@/lib/ai-guard";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<NextResponse<RefineResponse>> {
  const gate = await guardAI(req, "refine");
  if (!gate.allowed) {
    return NextResponse.json(
      { engine: "demo", config: null as never, changed: "", error: gate.message },
      { status: gate.status, headers: retryHeaders(gate.retryAfter) }
    );
  }

  const parsed = await readJsonCapped<RefineRequest>(req);
  if (!parsed.ok) {
    return NextResponse.json(
      { engine: "demo", config: null as never, changed: "", error: parsed.message },
      { status: parsed.status }
    );
  }
  const body = parsed.body;

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
