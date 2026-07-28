/**
 * Core data shapes for AgentMint.
 *
 * The AgentConfig is the product: it's what the factory produces from a
 * customer's description, what the playground runs, and (in later phases)
 * what gets published behind a share link / widget.
 */

export interface CaptureRules {
  /** Whether the agent should try to capture contact details / messages. */
  enabled: boolean;
  /** What to ask for when capturing, e.g. ["name", "email"]. */
  fields: string[];
  /** When to offer capture, in plain English (used in the system prompt). */
  trigger: string;
}

export interface AgentConfig {
  id: string;
  /** Short display name, e.g. "Trail Trip Planner". */
  name: string;
  /** Single emoji used as the agent's avatar. */
  emoji: string;
  /** One-line description shown on cards and the playground header. */
  tagline: string;
  /** The agent's job description, personality, and rules (system prompt core). */
  persona: string;
  /** First message the agent sends. */
  greeting: string;
  /** Chips the user can tap to start the conversation. */
  suggestedQuestions: string[];
  /** Owner-provided knowledge the agent answers from (plain text). */
  knowledge: string;
  /** Hard rules the agent must never break. */
  guardrails: string[];
  captureRules: CaptureRules;
  /** Template id this was seeded from, or "custom". */
  createdFrom: string;
  /** ISO timestamp. */
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** A lead/message the agent captured during a conversation. */
export interface Capture {
  id: string;
  agentId: string;
  summary: string;
  details: string;
  at: string;
}

/** Which engine produced a response. */
export type EngineMode = "live" | "demo";

// ---- API contracts ----

export interface GenerateRequest {
  description: string;
  /** Answers to follow-up questions; absent on the first call. */
  answers?: Record<string, string>;
  knowledge?: string;
  knowledgeUrl?: string;
}

export interface GenerateResponse {
  engine: EngineMode;
  /** Present when the factory needs more info before building. */
  followupQuestions?: string[];
  /** Present when the agent has been built. */
  config?: AgentConfig;
  error?: string;
}

export interface ChatRequest {
  config: AgentConfig;
  messages: ChatMessage[];
}

export interface ChatResponse {
  engine: EngineMode;
  reply: string;
  /** Set when the exchange contained a lead/message worth saving. */
  capture?: { summary: string; details: string };
  error?: string;
}

export interface RefineRequest {
  config: AgentConfig;
  instruction: string;
}

export interface RefineResponse {
  engine: EngineMode;
  config: AgentConfig;
  /** Plain-English confirmation of what changed. */
  changed: string;
  error?: string;
}
