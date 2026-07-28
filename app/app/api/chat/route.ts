import { NextResponse } from "next/server";
import type { ChatRequest, ChatResponse } from "@/lib/types";
import { isLive, demoChat } from "@/lib/engine";
import { liveChat } from "@/lib/anthropic";
import { normalizeConfig } from "@/lib/validate";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const runtime = "nodejs";

const MAX_TURNS = 40;

export async function POST(req: Request): Promise<NextResponse<ChatResponse>> {
  if (!rateLimit(`chat:${clientKey(req)}`, 30, 60_000)) {
    return NextResponse.json(
      { engine: "demo", reply: "", error: "Too many messages — give it a minute." },
      { status: 429 }
    );
  }

  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return NextResponse.json({ engine: "demo", reply: "", error: "Invalid request." }, { status: 400 });
  }

  const config = normalizeConfig(body.config);
  if (!config || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json(
      { engine: "demo", reply: "", error: "Missing agent or messages." },
      { status: 400 }
    );
  }

  const messages = body.messages.slice(-MAX_TURNS).map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: String(m.content ?? "").slice(0, 4000),
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
