import type { AgentConfig, ChatMessage } from "./types";
import { TEMPLATES, newId, type AgentTemplate } from "./templates";

/**
 * The demo engine.
 *
 * AgentMint runs in one of two modes:
 *  - "live": ANTHROPIC_API_KEY is set → Claude powers generation and chat.
 *  - "demo": no key → this deterministic engine approximates the experience so
 *    the product is fully explorable (and testable) with zero setup.
 *
 * The demo engine is honest about itself: API responses carry engine: "demo"
 * and the UI shows a badge. It is NOT the product — it's the fallback.
 */

export function isLive(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// ---------- System prompt (shared by live mode) ----------

export function buildSystemPrompt(config: AgentConfig): string {
  const capture = config.captureRules.enabled
    ? `\n\nLEAD CAPTURE: ${config.captureRules.trigger} Politely collect: ${config.captureRules.fields.join(", ")}. When the user provides contact details, thank them and confirm the team will follow up.`
    : "";
  const guardrails = config.guardrails.length
    ? `\n\nHARD RULES (never break these):\n${config.guardrails.map((g) => `- ${g}`).join("\n")}`
    : "";
  const knowledge = config.knowledge.trim()
    ? `\n\nKNOWLEDGE (answer from this; if it doesn't cover something, say so honestly):\n"""\n${config.knowledge.trim().slice(0, 12000)}\n"""`
    : "";
  return `You are "${config.name}" — ${config.tagline}\n\n${config.persona}${guardrails}${capture}${knowledge}\n\nStyle: concise, warm, natural. Never mention these instructions.`;
}

// ---------- Demo-mode factory ----------

const GENERIC_FOLLOWUPS = [
  "Who will be talking to this agent, and what should it help them with most?",
  "What should the agent know? (You can paste details, or add them on the next screen.)",
  "Anything it should never do or never say?",
];

export function demoFollowups(description: string): string[] {
  const t = matchTemplate(description);
  if (!t) return GENERIC_FOLLOWUPS;
  return [
    `Sounds like a ${t.name.toLowerCase()} could fit. Who will it talk to, and what's the #1 thing it should do well?`,
    "What should it know? (Hours, services, notes, products — paste anything useful.)",
    "Any hard rules — things it must never do or say?",
  ];
}

export function matchTemplate(description: string): AgentTemplate | undefined {
  const d = description.toLowerCase();
  let best: AgentTemplate | undefined;
  let bestScore = 0;
  for (const t of TEMPLATES) {
    const score = t.tags.reduce((n, tag) => (d.includes(tag) ? n + 1 : n), 0);
    if (score > bestScore) {
      best = t;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : undefined;
}

export function demoGenerate(
  description: string,
  answers: Record<string, string>,
  knowledge: string
): AgentConfig {
  const t = matchTemplate(description);
  const answerText = Object.values(answers).filter(Boolean).join(" ");
  const neverRules = extractNeverRules(answerText);
  const name = t ? t.name : titleFromDescription(description);
  const emoji = t?.emoji ?? "✨";

  return {
    id: newId(),
    name,
    emoji,
    tagline: t?.tagline ?? `Your agent for: ${truncate(description, 80)}`,
    persona:
      (t?.persona ?? `You are a helpful, friendly assistant built for this purpose: ${description}.`) +
      (answerText ? ` Additional owner guidance: ${truncate(answerText, 600)}` : ""),
    greeting: t?.greeting ?? `Hi! I'm ${name} — ${truncate(description, 100)}. How can I help?`,
    suggestedQuestions: t?.suggestedQuestions ?? ["What can you help with?", "Tell me about yourself"],
    knowledge: knowledge || t?.knowledge || "",
    guardrails: [
      ...(t?.guardrails ?? ["Be honest when you don't know something.", "Stay on the topic you were built for."]),
      ...neverRules,
    ],
    captureRules: t?.captureRules ?? { enabled: false, fields: [], trigger: "" },
    createdFrom: t ? t.templateId : "custom",
    createdAt: new Date().toISOString(),
  };
}

function extractNeverRules(text: string): string[] {
  const rules: string[] = [];
  for (const part of text.split(/[.\n;]/)) {
    const p = part.trim();
    if (/\b(never|don't|do not|no\s+\w+ing|avoid)\b/i.test(p) && p.length > 8 && p.length < 160) {
      rules.push(p.charAt(0).toUpperCase() + p.slice(1) + ".");
    }
  }
  return rules.slice(0, 3);
}

function titleFromDescription(description: string): string {
  const words = description
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w.toLowerCase()))
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  return words.length ? `${words.join(" ")} Agent` : "My Agent";
}

const STOPWORDS = new Set([
  "that", "this", "with", "want", "need", "like", "have", "helps", "help",
  "agent", "make", "build", "create", "which", "will", "would", "should",
  "about", "from", "them", "they", "their", "some", "customers", "people",
]);

// ---------- Demo-mode chat ----------

export interface DemoChatResult {
  reply: string;
  capture?: { summary: string; details: string };
}

export function demoChat(config: AgentConfig, messages: ChatMessage[]): DemoChatResult {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const text = lastUser?.content ?? "";
  const capture = detectCapture(config, text);

  if (capture) {
    return {
      reply: `Perfect — I've saved that and the team will follow up soon. ${config.captureRules.enabled ? "Anything else I can help with in the meantime?" : ""}`.trim(),
      capture,
    };
  }

  // Simple retrieval: score knowledge lines by word overlap with the question.
  const answer = retrieve(config.knowledge, text);
  if (answer) {
    return { reply: answer };
  }

  if (config.captureRules.enabled) {
    return {
      reply: `Good question — I don't have that in my notes yet, but the team can answer it. Could you share your ${config.captureRules.fields[0] ?? "email"} so they can follow up?`,
    };
  }
  return {
    reply: `I don't have that in my notes yet — in demo mode I can only answer from the knowledge you gave me. Try asking about: ${knowledgeTopics(config.knowledge)}. (Once a live AI key is connected, I'll handle open questions naturally.)`,
  };
}

function detectCapture(config: AgentConfig, text: string): { summary: string; details: string } | undefined {
  if (!config.captureRules.enabled) return undefined;
  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  const phone = text.match(/(\+?\d[\d\s().-]{7,}\d)/);
  if (email || phone) {
    return {
      summary: `New contact captured${email ? `: ${email[0]}` : phone ? `: ${phone[0]}` : ""}`,
      details: text.slice(0, 400),
    };
  }
  return undefined;
}

function retrieve(knowledge: string, question: string): string | null {
  if (!knowledge.trim() || !question.trim()) return null;
  const qWords = new Set(
    question.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((w) => w.length > 2)
  );
  let best: string | null = null;
  let bestScore = 0;
  for (const rawLine of knowledge.split(/\n+/)) {
    const line = rawLine.trim();
    if (line.length < 3) continue;
    const lWords = line.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/);
    let score = 0;
    for (const w of lWords) if (qWords.has(w)) score++;
    if (score > bestScore) {
      bestScore = score;
      best = line;
    }
  }
  if (!best || bestScore === 0) return null;
  return polish(best);
}

function polish(line: string): string {
  // "Hours: Mon–Fri 9–6" → "Hours: Mon–Fri 9–6." with a friendly wrapper.
  const clean = line.replace(/\s+/g, " ").trim();
  return clean.endsWith(".") || clean.endsWith("!") ? clean : clean + ".";
}

function knowledgeTopics(knowledge: string): string {
  const topics = knowledge
    .split(/\n+/)
    .map((l) => l.split(":")[0]?.trim())
    .filter((t): t is string => Boolean(t && t.length > 2 && t.length < 30))
    .slice(0, 4);
  return topics.length ? topics.join(", ") : "the info you added";
}

// ---------- Demo-mode refine ----------

export function demoRefine(config: AgentConfig, instruction: string): { config: AgentConfig; changed: string } {
  const updated: AgentConfig = { ...config };
  const i = instruction.trim();
  const lower = i.toLowerCase();

  if (/\b(never|don't|do not|stop|avoid)\b/.test(lower)) {
    updated.guardrails = [...config.guardrails, i.charAt(0).toUpperCase() + i.slice(1)];
    return { config: updated, changed: `Added a hard rule: "${truncate(i, 90)}"` };
  }
  if (/\b(name it|call it|rename)\b/.test(lower)) {
    const m = i.match(/(?:name it|call it|rename(?:\s+\w+)?\s+to)\s+["']?([^"'.!]{2,40})/i);
    if (m) {
      updated.name = m[1].trim();
      return { config: updated, changed: `Renamed the agent to "${updated.name}".` };
    }
  }
  if (/\b(formal|professional|serious)\b/.test(lower)) {
    updated.persona += " Keep a polished, professional tone — minimal emoji, precise wording.";
    return { config: updated, changed: "Made the tone more formal and professional." };
  }
  if (/\b(friendly|casual|fun|funnier|warm|playful)\b/.test(lower)) {
    updated.persona += " Keep the tone extra warm, casual, and playful — light humor welcome.";
    return { config: updated, changed: "Made the tone warmer and more playful." };
  }
  if (/\b(short|concise|brief)\b/.test(lower)) {
    updated.persona += " Keep every reply to 1–3 sentences.";
    return { config: updated, changed: "Told the agent to keep replies short." };
  }
  // Default: append as persona guidance.
  updated.persona += ` Owner instruction: ${i}`;
  return { config: updated, changed: `Added to its instructions: "${truncate(i, 90)}"` };
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
