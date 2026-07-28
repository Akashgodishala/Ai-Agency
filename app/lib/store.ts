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

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked — the UI surfaces errors at the call site.
  }
}

export function listAgents(): AgentConfig[] {
  return read<AgentConfig[]>(AGENTS_KEY, []);
}

export function getAgent(id: string): AgentConfig | undefined {
  return listAgents().find((a) => a.id === id);
}

export function saveAgent(config: AgentConfig): void {
  const agents = listAgents().filter((a) => a.id !== config.id);
  agents.unshift(config);
  write(AGENTS_KEY, agents);
}

export function deleteAgent(id: string): void {
  write(AGENTS_KEY, listAgents().filter((a) => a.id !== id));
  write(CAPTURES_KEY, listCaptures().filter((c) => c.agentId !== id));
}

export function listCaptures(agentId?: string): Capture[] {
  const all = read<Capture[]>(CAPTURES_KEY, []);
  return agentId ? all.filter((c) => c.agentId === agentId) : all;
}

export function saveCapture(c: Capture): void {
  const all = read<Capture[]>(CAPTURES_KEY, []);
  all.unshift(c);
  write(CAPTURES_KEY, all);
}
