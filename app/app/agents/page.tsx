"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AgentConfig } from "@/lib/types";
import { listAgents, listCaptures } from "@/lib/store";

export default function MyAgents() {
  const [agents, setAgents] = useState<AgentConfig[] | null>(null);
  const [captureCounts, setCaptureCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const all = listAgents();
    setAgents(all);
    const counts: Record<string, number> = {};
    for (const a of all) counts[a.id] = listCaptures(a.id).length;
    setCaptureCounts(counts);
  }, []);

  if (agents === null) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <h1 className="text-3xl font-semibold">My agents</h1>
      <p className="mt-2 text-muted">
        Agents you've minted in this browser. (Accounts that sync across devices arrive with the
        publish phase.)
      </p>

      {agents.length === 0 ? (
        <div className="mt-12 rounded-card border border-dashed border-line p-12 text-center">
          <p className="text-lg font-semibold">No agents yet</p>
          <p className="mt-1.5 text-sm text-muted">Describe one, or grab one from the gallery.</p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-full bg-mint px-5 py-2.5 text-sm font-semibold text-white hover:bg-mint-deep"
          >
            Mint your first agent →
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((a) => (
            <Link
              key={a.id}
              href={`/playground/${a.id}`}
              className="group rounded-card border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:border-mint"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-mint-soft text-xl">
                  {a.emoji}
                </span>
                {captureCounts[a.id] > 0 && (
                  <span className="rounded-full bg-mint-soft px-2.5 py-1 text-[11px] font-semibold text-mint-deep">
                    {captureCounts[a.id]} in inbox
                  </span>
                )}
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold">{a.name}</h2>
              <p className="mt-1.5 line-clamp-2 text-sm text-muted">{a.tagline}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-mint">
                Open playground
                <span className="transition group-hover:translate-x-0.5">→</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
