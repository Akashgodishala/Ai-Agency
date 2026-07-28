import Anthropic from "@anthropic-ai/sdk";
import type { AgentConfig, ChatMessage } from "./types";
import { buildSystemPrompt } from "./engine";
import { newId } from "./templates";

/**
 * Live engine — used when ANTHROPIC_API_KEY is set.
 * Claude powers three jobs: generating an agent from a description,
 * chatting as that agent, and refining an agent from a plain-English note.
 */

const MODEL = process.env.AGENTMINT_MODEL || "claude-sonnet-5";

function client(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

async function complete(system: string, userText: string, maxTokens = 1500): Promise<string> {
  const msg = await client().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: userText }],
  });
  const block = msg.content.find((b) => b.type === "text");
  return block && "text" in block ? block.text : "";
}

// ---------- Follow-up questions ----------

export async function liveFollowups(description: string): Promise<string[]> {
  const raw = await complete(
    `You help people create their own AI agent. Given a user's description of what they want, write exactly 3 short, friendly follow-up questions that would most improve the agent: one about audience/main job, one about what the agent should know, one about limits/rules. Return ONLY a JSON array of 3 strings.`,
    description,
    400
  );
  const parsed = safeJson<string[]>(raw);
  if (Array.isArray(parsed) && parsed.length >= 2) return parsed.slice(0, 3).map(String);
  return [
    "Who will talk to this agent, and what should it do best?",
    "What should it know? Paste any useful details.",
    "Anything it must never do or say?",
  ];
}

// ---------- Agent generation ----------

const CONFIG_SHAPE = `{
  "name": "short display name",
  "emoji": "one emoji",
  "tagline": "one-line description",
  "persona": "2-4 sentence job description, personality, and behavior",
  "greeting": "the agent's first message",
  "suggestedQuestions": ["3-4 example questions users might ask"],
  "guardrails": ["2-4 hard rules it must never break"],
  "captureRules": { "enabled": true|false, "fields": ["what contact info to collect"], "trigger": "when to collect it" }
}`;

export async function liveGenerate(
  description: string,
  answers: Record<string, string>,
  knowledge: string
): Promise<AgentConfig> {
  const answerLines = Object.entries(answers)
    .map(([q, a]) => `Q: ${q}\nA: ${a}`)
    .join("\n");
  const raw = await complete(
    `You are the agent factory for AgentMint, a platform where anyone creates their own AI agent. Design the best possible agent for the user's need. Enable captureRules only if collecting visitor contact details clearly serves the owner (e.g. business inquiries). Return ONLY valid JSON matching:\n${CONFIG_SHAPE}`,
    `What the user wants:\n${description}\n\nTheir answers to follow-ups:\n${answerLines || "(none)"}\n\nThey provided knowledge: ${knowledge ? "yes" : "no"}`,
    1200
  );
  const p = safeJson<Partial<AgentConfig>>(raw) ?? {};
  return {
    id: newId(),
    name: str(p.name, "My Agent"),
    emoji: str(p.emoji, "✨").slice(0, 4),
    tagline: str(p.tagline, description.slice(0, 90)),
    persona: str(p.persona, `You are a helpful assistant for: ${description}`),
    greeting: str(p.greeting, "Hi! How can I help?"),
    suggestedQuestions: strArr(p.suggestedQuestions, ["What can you do?"]),
    knowledge,
    guardrails: strArr(p.guardrails, ["Be honest when you don't know something."]),
    captureRules: {
      enabled: Boolean(p.captureRules?.enabled),
      fields: strArr(p.captureRules?.fields, []),
      trigger: str(p.captureRules?.trigger, ""),
    },
    createdFrom: "custom",
    createdAt: new Date().toISOString(),
  };
}

// ---------- Chat ----------

export async function liveChat(
  config: AgentConfig,
  messages: ChatMessage[]
): Promise<{ reply: string; capture?: { summary: string; details: string } }> {
  const msg = await client().messages.create({
    model: MODEL,
    max_tokens: 700,
    system: buildSystemPrompt(config),
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
  const block = msg.content.find((b) => b.type === "text");
  const reply = block && "text" in block ? block.text : "…";

  // Capture detection stays deterministic (regex) even in live mode —
  // the owner's inbox should never depend on model formatting.
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const email = lastUser.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  const phone = lastUser.match(/(\+?\d[\d\s().-]{7,}\d)/);
  const capture =
    config.captureRules.enabled && (email || phone)
      ? {
          summary: `New contact captured${email ? `: ${email[0]}` : `: ${phone![0]}`}`,
          details: lastUser.slice(0, 400),
        }
      : undefined;
  return { reply, capture };
}

// ---------- Refine ----------

export async function liveRefine(
  config: AgentConfig,
  instruction: string
): Promise<{ config: AgentConfig; changed: string }> {
  const raw = await complete(
    `You update an AI agent's configuration based on the owner's plain-English instruction. Apply the smallest change that fulfills it. Return ONLY JSON: {"config": <the full updated config, same shape as given>, "changed": "one sentence describing what you changed"}. Never change the id, createdFrom, or createdAt fields. Keep "knowledge" unchanged unless the instruction is about knowledge.`,
    `Current config:\n${JSON.stringify(config)}\n\nOwner instruction:\n${instruction}`,
    2000
  );
  const p = safeJson<{ config?: AgentConfig; changed?: string }>(raw);
  if (p?.config && typeof p.config === "object") {
    // Preserve immutable fields regardless of model output.
    const updated: AgentConfig = {
      ...config,
      ...p.config,
      id: config.id,
      createdFrom: config.createdFrom,
      createdAt: config.createdAt,
    };
    return { config: updated, changed: str(p.changed, "Updated the agent.") };
  }
  return { config, changed: "I couldn't apply that — try rephrasing." };
}

// ---------- Helpers ----------

function safeJson<T>(raw: string): T | null {
  // Models sometimes wrap JSON in prose or code fences; extract the first
  // JSON object/array in the text.
  const m = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || raw.match(/([\[{][\s\S]*[\]}])/);
  const candidate = m ? m[1] : raw;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    return null;
  }
}

function str(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function strArr(v: unknown, fallback: string[]): string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string") && v.length ? v : fallback;
}
