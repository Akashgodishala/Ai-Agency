"use client";

import { useEffect, useRef } from "react";
import { divisionLabel, formatCount, groupLabel, type AgencyAgent } from "@/lib/agency";
import { AgencyMark } from "./AgencyMark";

/**
 * The detail panel for one agent: a plate that slides in from the right (a
 * full sheet on a phone) over the roster. It carries everything the data file
 * knows about the agent and two actions — mint it here, or read the full
 * persona upstream.
 *
 * Scrolling: the panel is its own scroll box. `data-lenis-prevent` keeps the
 * smooth-scroll engine's hands off it, and wheel events are stopped at the
 * overlay so a scroll over the backdrop does not move the page underneath.
 */
export function AgentDrawer({
  agent,
  onClose,
  onMint,
}: {
  agent: AgencyAgent | null;
  onClose: () => void;
  onMint: (agent: AgencyAgent) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = agent !== null;

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!agent) return null;
  const a = agent;
  const titleId = `agent-title-${a.slug}`;

  return (
    <div
      className="fixed inset-0 z-overlay flex justify-end"
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Backdrop — a wash of ink, closes on click. */}
      <button
        type="button"
        aria-label="Close agent details"
        onClick={onClose}
        className="drawer-backdrop absolute inset-0 bg-ink/70 backdrop-blur-[2px]"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-lenis-prevent
        className="drawer-panel relative flex h-full w-full max-w-[34rem] flex-col overflow-y-auto border-l border-rule bg-plate shadow-deep"
      >
        <div className="sticky top-0 z-content flex items-center justify-between border-b border-rule bg-plate/95 px-6 py-4 backdrop-blur">
          <span className="assay">
            {divisionLabel(a.division)}
            {a.group ? ` · ${groupLabel(a.group)}` : ""}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="assay border border-rule px-3 py-1.5 normal-case tracking-[0.08em] text-muted transition-colors duration-200 ease-struck hover:border-mint hover:text-paper"
          >
            Close <span className="hidden sm:inline">· Esc</span>
          </button>
        </div>

        <div className="flex flex-col gap-8 px-6 py-8">
          <header className="group flex flex-col gap-5">
            <AgencyMark name={a.name} division={a.division} size={84} tone="mint" />
            <div className="flex flex-col gap-3">
              <h2 id={titleId} className="font-display text-title">
                {a.name}
              </h2>
              {a.vibe && (
                <p className="font-display text-[1.15rem] italic leading-snug text-muted">{a.vibe}</p>
              )}
            </div>
          </header>

          <p className="text-[0.98rem] leading-relaxed text-paper/90">{a.description}</p>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onMint(a)}
              className="strike-btn assay px-5 py-3 text-center normal-case tracking-[0.08em]"
            >
              Mint this agent
            </button>
            <a
              href={a.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="strike-ghost assay px-5 py-3 text-center normal-case tracking-[0.08em]"
            >
              Read the full spec on GitHub
            </a>
          </div>

          {/* Assay */}
          <dl className="grid grid-cols-2 gap-px border border-rule bg-rule text-sm sm:grid-cols-4">
            <Fact label="Spec length" value={`${formatCount(a.words)} words`} />
            <Fact label="Sections" value={String(a.headings.length)} />
            <Fact label="Tools" value={a.tools.length ? String(a.tools.length) : "Not declared"} />
            <Fact label="Author" value={a.author ?? "The Agency"} />
          </dl>

          {a.tools.length > 0 && (
            <section className="flex flex-col gap-3" aria-label="Tools this agent declares">
              <h3 className="assay">Tools declared</h3>
              <ul className="flex flex-wrap gap-1.5">
                {a.tools.map((t) => (
                  <li key={t} className="assay border border-rule px-2.5 py-1 normal-case tracking-[0.08em] text-muted">
                    {t}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {a.services.length > 0 && (
            <section className="flex flex-col gap-3" aria-label="External services this agent relies on">
              <h3 className="assay">Relies on</h3>
              <ul className="flex flex-col gap-2">
                {a.services.map((s) => (
                  <li key={s.name} className="flex items-center justify-between gap-3 text-sm">
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-paper underline decoration-rule underline-offset-4 transition-colors hover:decoration-mint"
                      >
                        {s.name}
                      </a>
                    ) : (
                      <span className="text-paper">{s.name}</span>
                    )}
                    {s.tier && <span className="assay">{s.tier}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="flex flex-col gap-3" aria-label="What the spec covers">
            <h3 className="assay">What the spec covers</h3>
            <ol className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {a.headings.map((h, i) => (
                <li key={`${h}-${i}`} className="flex gap-3 text-[0.9rem] leading-snug text-muted">
                  <span className="font-mono text-xs tabular-nums text-dim">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{h}</span>
                </li>
              ))}
            </ol>
          </section>

          <p className="font-mono text-xs text-dim">{a.path}</p>
        </div>
      </aside>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 bg-plate p-3">
      <dt className="assay">{label}</dt>
      <dd className="truncate text-paper" title={value}>
        {value}
      </dd>
    </div>
  );
}
