import type { AgentConfig } from "./types";
import { KNOWLEDGE_LIMIT } from "./engine";

/**
 * Server-side config normalization.
 * API routes accept an AgentConfig from the client (v1 stores agents in the
 * browser), so every field must be coerced to a safe shape and length before
 * it reaches an engine or a system prompt. Returns null for hopeless input.
 */

const CAPS = {
  name: 80,
  emoji: 8,
  tagline: 160,
  persona: 4000,
  greeting: 1000,
  question: 140,
  questions: 6,
  guardrail: 300,
  guardrails: 10,
  captureField: 60,
  captureFields: 5,
  captureTrigger: 300,
  id: 40,
};

function s(v: unknown, max: number, fallback = ""): string {
  return typeof v === "string" ? v.slice(0, max) : fallback;
}

function sa(v: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .slice(0, maxItems)
    .map((x) => x.slice(0, maxLen));
}

export function normalizeConfig(raw: unknown): AgentConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = s(r.id, CAPS.id);
  const name = s(r.name, CAPS.name);
  if (!id || !name) return null;

  const cr = (r.captureRules ?? {}) as Record<string, unknown>;
  return {
    id,
    name,
    emoji: s(r.emoji, CAPS.emoji, "✨"),
    tagline: s(r.tagline, CAPS.tagline),
    persona: s(r.persona, CAPS.persona),
    greeting: s(r.greeting, CAPS.greeting),
    suggestedQuestions: sa(r.suggestedQuestions, CAPS.questions, CAPS.question),
    knowledge: s(r.knowledge, KNOWLEDGE_LIMIT),
    guardrails: sa(r.guardrails, CAPS.guardrails, CAPS.guardrail),
    captureRules: {
      enabled: Boolean(cr.enabled),
      fields: sa(cr.fields, CAPS.captureFields, CAPS.captureField),
      trigger: s(cr.trigger, CAPS.captureTrigger),
    },
    createdFrom: s(r.createdFrom, 60, "custom"),
    createdAt: s(r.createdAt, 40, ""),
  };
}
