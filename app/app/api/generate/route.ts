import { NextResponse } from "next/server";
import type { GenerateRequest, GenerateResponse } from "@/lib/types";
import { isLive, demoFollowups, demoGenerate } from "@/lib/engine";
import { liveFollowups, liveGenerate } from "@/lib/anthropic";

export const runtime = "nodejs";

const MAX_KNOWLEDGE = 20000;

export async function POST(req: Request): Promise<NextResponse<GenerateResponse>> {
  let body: GenerateRequest;
  try {
    body = (await req.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ engine: "demo", error: "Invalid request." }, { status: 400 });
  }

  const description = (body.description ?? "").trim().slice(0, 2000);
  if (!description) {
    return NextResponse.json(
      { engine: isLive() ? "live" : "demo", error: "Tell us what your agent should do." },
      { status: 400 }
    );
  }

  const engine = isLive() ? "live" : "demo";

  // Phase 1 of the flow: no answers yet → return follow-up questions.
  if (!body.answers) {
    try {
      const followupQuestions = engine === "live" ? await liveFollowups(description) : demoFollowups(description);
      return NextResponse.json({ engine, followupQuestions });
    } catch (e) {
      // Live engine hiccup → degrade gracefully to demo questions.
      return NextResponse.json({ engine: "demo", followupQuestions: demoFollowups(description) });
    }
  }

  // Phase 2: build the agent.
  let knowledge = (body.knowledge ?? "").slice(0, MAX_KNOWLEDGE);
  if (body.knowledgeUrl) {
    const fetched = await fetchKnowledge(body.knowledgeUrl);
    if (fetched) knowledge = (knowledge + "\n\n" + fetched).slice(0, MAX_KNOWLEDGE);
  }

  try {
    const config =
      engine === "live"
        ? await liveGenerate(description, body.answers, knowledge)
        : demoGenerate(description, body.answers, knowledge);
    return NextResponse.json({ engine, config });
  } catch (e) {
    const config = demoGenerate(description, body.answers, knowledge);
    return NextResponse.json({ engine: "demo", config });
  }
}

/** Fetch a public web page and reduce it to plain text the agent can use. */
async function fetchKnowledge(url: string): Promise<string | null> {
  try {
    const parsed = new URL(url);
    if (!/^https?:$/.test(parsed.protocol)) return null;
    const res = await fetch(parsed.toString(), {
      headers: { "User-Agent": "AgentMint/0.1 (+knowledge-import)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
    return text ? `From ${parsed.hostname}:\n${text.slice(0, 8000)}` : null;
  } catch {
    return null;
  }
}
