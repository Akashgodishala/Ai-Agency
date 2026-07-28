import { NextResponse } from "next/server";
import type { ChatRequest, ChatResponse } from "@/lib/types";
import { isLive, demoChat } from "@/lib/engine";
import { liveChat } from "@/lib/anthropic";

export const runtime = "nodejs";

const MAX_TURNS = 40;

export async function POST(req: Request): Promise<NextResponse<ChatResponse>> {
  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return NextResponse.json({ engine: "demo", reply: "", error: "Invalid request." }, { status: 400 });
  }

  if (!body.config || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json(
      { engine: "demo", reply: "", error: "Missing agent or messages." },
      { status: 400 }
    );
  }

  const messages = body.messages.slice(-MAX_TURNS).map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: String(m.content ?? "").slice(0, 4000),
  }));

  if (isLive()) {
    try {
      const { reply, capture } = await liveChat(body.config, messages);
      return NextResponse.json({ engine: "live", reply, capture });
    } catch {
      // Fall through to demo so the conversation never dies mid-chat.
    }
  }

  const { reply, capture } = demoChat(body.config, messages);
  return NextResponse.json({ engine: "demo", reply, capture });
}
