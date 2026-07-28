import type { AgentConfig } from "./types";
import { FINANCE_AGENTS } from "./catalog/finance";
import { REAL_ESTATE_AGENTS } from "./catalog/realestate";
import { WORK_AGENTS } from "./catalog/work";
import { MARKETING_AGENTS } from "./catalog/marketing";
import { COMMERCE_AGENTS } from "./catalog/commerce";
import { CAREER_AGENTS } from "./catalog/career";

/**
 * The agent gallery — 50 flagship ready-made agents across six categories,
 * defined in lib/catalog/. Each is a full AgentConfig minus id/createdAt
 * (stamped at instantiation). Every template is framed honestly within v1
 * abilities: text chat, owner-provided knowledge, lead capture.
 */

export interface AgentTemplate extends Omit<AgentConfig, "id" | "createdAt" | "createdFrom"> {
  templateId: string;
  /** Keywords used by the demo-mode factory to match free-text descriptions. */
  tags: string[];
  /** Who this is for — shown on gallery cards. */
  audience: string;
  /** Gallery category, e.g. "Money & Finance". */
  category: string;
}

/**
 * Capability aliases: extra search tags so common phrasings ("receptionist",
 * "invoice review") always surface the right agents in the gallery search
 * and the description-matcher.
 */
const EXTRA_TAGS: Record<string, string[]> = {
  "customer-support-bot": ["receptionist", "reception", "front desk", "call support"],
  "voice-agent": ["voice agents", "receptionist", "call support"],
  "invoice-automation": ["invoice review", "invoice review agent"],
};

export const TEMPLATES: AgentTemplate[] = [
  ...FINANCE_AGENTS,
  ...REAL_ESTATE_AGENTS,
  ...WORK_AGENTS,
  ...MARKETING_AGENTS,
  ...COMMERCE_AGENTS,
  ...CAREER_AGENTS,
].map((t) => (EXTRA_TAGS[t.templateId] ? { ...t, tags: [...t.tags, ...EXTRA_TAGS[t.templateId]] } : t));

export function getTemplate(templateId: string): AgentTemplate | undefined {
  return TEMPLATES.find((t) => t.templateId === templateId);
}

/** Instantiate a template into a full AgentConfig. */
export function instantiateTemplate(t: AgentTemplate): AgentConfig {
  return {
    id: newId(),
    name: t.name,
    emoji: t.emoji,
    tagline: t.tagline,
    persona: t.persona,
    greeting: t.greeting,
    suggestedQuestions: t.suggestedQuestions,
    knowledge: t.knowledge,
    guardrails: t.guardrails,
    captureRules: t.captureRules,
    createdFrom: t.templateId,
    createdAt: new Date().toISOString(),
  };
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}
