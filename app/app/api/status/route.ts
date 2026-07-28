import { NextResponse } from "next/server";
import { isLive } from "@/lib/engine";

export const runtime = "nodejs";

/**
 * Lets the UI know which engine will answer BEFORE the first message is sent,
 * so demo mode is labeled up front — never only after the fact.
 */
export async function GET() {
  return NextResponse.json({ engine: isLive() ? "live" : "demo" });
}
