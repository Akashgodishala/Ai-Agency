import Anthropic from "@anthropic-ai/sdk";
import type { AgentConfig, ChatMessage } from "./types";
import { buildSystemPrompt, detectContact } from "./engine";
import { newId } from "./templates";

/**
 * Live engine — used when ANTHROPIC_API_KEY is set.
 * Claude powers three jobs: generating an agent from a description,
 * chatting as that agent, and refining an agent from a plain-English note.
 */

/**
 * Model choice is a cost decision, so it lives in one place and defaults to the
 * cheapest model that does this job well. These agents answer short,
 * well-scoped questions from a system prompt — shop hours, expense categories,
 * booking rules — which Haiku 4.5 handles at a fifth of Opus pricing and a
 * third of Sonnet's. Override with AGENTMINT_MODEL if a workload needs more.
 */
const MODEL = process.env.AGENTMINT_MODEL || "claude-haiku-4-5";

/**
 * The hard ceiling on any single completion, whatever a caller asks for.
 *
 * max_tokens is an enforced cap on the model's OUTPUT — it does not limit the
 * prompt, and the model is not told about it, so this bounds cost rather than
 * shaping the answer. Output tokens are the expensive half (5x input on Haiku),
 * which is why the ceiling sits here and not only at each call site.
 */
const MAX_OUTPUT_TOKENS = 1200;

function capTokens(requested: number): number {
  return Math.max(1, Math.min(requested, MAX_OUTPUT_TOKENS));
}

function client(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

async function complete(system: string, userText: string, maxTokens = 1000): Promise<string> {
  const msg = await client().messages.create({
    model: MODEL,
    max_tokens: capTokens(maxTokens),
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

/**
 * The conversation is the expensive part, and it grows every turn.
 *
 * Input is billed on the WHOLE history, resent on each message — so an
 * unbounded transcript makes every subsequent reply cost more than the last,
 * and a visitor pasting long blocks repeatedly is the cheapest way to drain an
 * account. Cap the total characters and drop the OLDEST turns first: recent
 * context is what the next reply actually depends on.
 */
const MAX_HISTORY_CHARS = 24_000;

export function trimHistory(messages: ChatMessage[]): ChatMessage[] {
  const kept: ChatMessage[] = [];
  let total = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    const size = (m.content ?? "").length;
    // Always keep the newest turn, even if it alone exceeds the budget — the
    // route has already clamped any single message to a safe length.
    if (kept.length > 0 && total + size > MAX_HISTORY_CHARS) break;
    kept.unshift(m);
    total += size;
  }
  return kept;
}

export async function liveChat(
  config: AgentConfig,
  messages: ChatMessage[]
): Promise<{ reply: string; capture?: { summary: string; details: string } }> {
  // The Anthropic Messages API requires the first message to be role "user".
  // The playground seeds conversations with the agent's greeting (assistant),
  // so strip leading assistant turns — otherwise every live chat 400s.
  const turns = trimHistory([...messages]);
  while (turns.length && turns[0].role === "assistant") turns.shift();
  if (turns.length === 0) return { reply: config.greeting };

  const msg = await client().messages.create({
    model: MODEL,
    max_tokens: capTokens(700),
    system: buildSystemPrompt(config),
    messages: turns.map((m) => ({ role: m.role, content: m.content })),
  });
  const block = msg.content.find((b) => b.type === "text");
  const reply = block && "text" in block ? block.text : "…";

  // Capture detection stays deterministic (regex) even in live mode —
  // the owner's inbox should never depend on model formatting.
  const lastUser = [...turns].reverse().find((m) => m.role === "user")?.content ?? "";
  const { email, phone } = detectContact(lastUser);
  const capture =
    config.captureRules.enabled && (email || phone)
      ? {
          summary: `New contact captured: ${email ?? phone}`,
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
    1200
  );
  const p = safeJson<{ config?: Partial<AgentConfig>; changed?: string }>(raw);
  if (p?.config && typeof p.config === "object") {
    const u = p.config;
    // Validate field-by-field — never spread raw model output into a persisted
    // object (a malformed field would brick the agent on every later chat).
    const cr = u.captureRules;
    const updated: AgentConfig = {
      id: config.id,
      createdFrom: config.createdFrom,
      createdAt: config.createdAt,
      name: str(u.name, config.name),
      emoji: str(u.emoji, config.emoji).slice(0, 4),
      tagline: str(u.tagline, config.tagline),
      persona: str(u.persona, config.persona),
      greeting: str(u.greeting, config.greeting),
      suggestedQuestions: strArr(u.suggestedQuestions, config.suggestedQuestions),
      // Knowledge changes only when the instruction is about knowledge.
      knowledge: /knowledge|know|info|notes|facts/i.test(instruction)
        ? str(u.knowledge, config.knowledge)
        : config.knowledge,
      guardrails: strArr(u.guardrails, config.guardrails),
      captureRules:
        cr && typeof cr === "object"
          ? {
              enabled: typeof cr.enabled === "boolean" ? cr.enabled : config.captureRules.enabled,
              fields: strArr(cr.fields, config.captureRules.fields),
              trigger: str(cr.trigger, config.captureRules.trigger),
            }
          : config.captureRules,
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
