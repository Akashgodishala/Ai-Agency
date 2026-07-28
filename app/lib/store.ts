"use client";

import type { AgentConfig, Capture } from "./types";

/**
 * v1 storage: the browser's localStorage.
 * Agents live on the creator's device — good enough for the playground phase.
 * Phase 2 (accounts + publish) moves this behind a database; the interface
 * below is deliberately shaped so that swap is invisible to the UI.
 */

const AGENTS_KEY = "agentmint.agents";
const CAPTURES_KEY = "agentmint.captures";

function readArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    // Corruption / cross-tab weirdness must never take down a page.
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/** Returns false when storage is full or blocked — callers must surface it. */
function write<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function listAgents(): AgentConfig[] {
  return readArray<AgentConfig>(AGENTS_KEY);
}

export function getAgent(id: string): AgentConfig | undefined {
  return listAgents().find((a) => a.id === id);
}

/** Returns false if the agent could not be persisted (storage full/blocked). */
export function saveAgent(config: AgentConfig): boolean {
  const agents = listAgents().filter((a) => a.id !== config.id);
  agents.unshift(config);
  return write(AGENTS_KEY, agents);
}

export function deleteAgent(id: string): void {
  write(AGENTS_KEY, listAgents().filter((a) => a.id !== id));
  write(CAPTURES_KEY, listCaptures().filter((c) => c.agentId !== id));
}

export function listCaptures(agentId?: string): Capture[] {
  const all = readArray<Capture>(CAPTURES_KEY);
  return agentId ? all.filter((c) => c.agentId === agentId) : all;
}

const MAX_CAPTURES = 500;

export function saveCapture(c: Capture): void {
  const all = readArray<Capture>(CAPTURES_KEY);
  all.unshift(c);
  write(CAPTURES_KEY, all.slice(0, MAX_CAPTURES));
}

// ---- Purchase interest (v1: checkout isn't live; we record intent) ----

export interface PurchaseInterest {
  agentId: string;
  agentName: string;
  email: string;
  at: string;
}

const INTEREST_KEY = "agentmint.interest";

export function saveInterest(i: PurchaseInterest): boolean {
  const all = readArray<PurchaseInterest>(INTEREST_KEY);
  all.unshift(i);
  return write(INTEREST_KEY, all.slice(0, 100));
}
