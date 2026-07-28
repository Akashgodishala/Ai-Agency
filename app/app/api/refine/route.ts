import { NextResponse } from "next/server";
import type { RefineRequest, RefineResponse } from "@/lib/types";
import { isLive, demoRefine } from "@/lib/engine";
import { liveRefine } from "@/lib/anthropic";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<NextResponse<RefineResponse>> {
  let body: RefineRequest;
  try {
    body = (await req.json()) as RefineRequest;
  } catch {
    return NextResponse.json(
      { engine: "demo", config: null as never, changed: "", error: "Invalid request." },
      { status: 400 }
    );
  }

  const instruction = (body.instruction ?? "").trim().slice(0, 1000);
  if (!body.config || !instruction) {
    return NextResponse.json(
      { engine: "demo", config: body.config, changed: "", error: "Tell the agent how to change." },
      { status: 400 }
    );
  }

  if (isLive()) {
    try {
      const { config, changed } = await liveRefine(body.config, instruction);
      return NextResponse.json({ engine: "live", config, changed });
    } catch {
      // Fall through to demo refine.
    }
  }

  const { config, changed } = demoRefine(body.config, instruction);
  return NextResponse.json({ engine: "demo", config, changed });
}
