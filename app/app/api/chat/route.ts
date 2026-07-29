import { NextResponse } from "next/server";
import type { ChatRequest, ChatResponse } from "@/lib/types";
import { isLive, demoChat } from "@/lib/engine";
import { liveChat } from "@/lib/anthropic";
import { normalizeConfig } from "@/lib/validate";
import { guardAI, retryHeaders, readJsonCapped } from "@/lib/ai-guard";

export const runtime = "nodejs";

/** Turn cap; lib/anthropic.ts additionally caps the history by total size. */
const MAX_TURNS = 20;
/** Longest single message accepted. Anything past this is truncated, not rejected. */
const MAX_MESSAGE_CHARS = 4000;

export async function POST(req: Request): Promise<NextResponse<ChatResponse>> {
  // Kill switch + quota, before anything reaches Anthropic.
  const gate = await guardAI(req, "chat");
  if (!gate.allowed) {
    return NextResponse.json(
      { engine: "demo", reply: "", error: gate.message },
      { status: gate.status, headers: retryHeaders(gate.retryAfter) }
    );
  }

  const parsed = await readJsonCapped<ChatRequest>(req);
  if (!parsed.ok) {
    return NextResponse.json(
      { engine: "demo", reply: "", error: parsed.message },
      { status: parsed.status }
    );
  }
  const body = parsed.body;

  const config = normalizeConfig(body.config);
  if (!config || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json(
      { engine: "demo", reply: "", error: "Missing agent or messages." },
      { status: 400 }
    );
  }

  const messages = body.messages.slice(-MAX_TURNS).map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: String(m.content ?? "").slice(0, MAX_MESSAGE_CHARS),
  }));
  // The Messages API requires a user-first conversation; the UI seeds chats
  // with the agent greeting, so drop leading assistant turns.
  while (messages.length && messages[0].role === "assistant") messages.shift();
  if (messages.length === 0) {
    return NextResponse.json(
      { engine: "demo", reply: "", error: "Missing a user message." },
      { status: 400 }
    );
  }

  if (isLive()) {
    try {
      const { reply, capture } = await liveChat(config, messages);
      return NextResponse.json({ engine: "live", reply, capture });
    } catch (err) {
      // Never let the conversation die mid-chat — but never hide the
      // degradation either (the response says engine:"demo" and the UI
      // surfaces the switch).
      console.error("liveChat failed, degrading to demo:", err);
    }
  }

  const { reply, capture } = demoChat(config, messages);
  return NextResponse.json({ engine: "demo", reply, capture });
}
