"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { divisionLabel, formatCount, groupLabel, sourceUrlOf, type AgencyAgent } from "@/lib/agency";
import { AgencyMark } from "./AgencyMark";

/**
 * The detail panel for one agent: a plate that slides in from the right (a
 * full sheet on a phone) over the roster. It carries everything the data file
 * knows about the agent and two actions — mint it here, or read the full
 * persona upstream.
 *
 * It is a real modal. It renders through a portal onto <body>, and while it
 * is open every other child of <body> is made `inert`, so neither Tab nor a
 * screen reader can wander into the page behind the wash; a small Tab wrap
 * covers browsers without `inert`. Escape closes it. Focus goes to Close on
 * open and back to whatever opened it on close (the dashboard owns that).
 *
 * Scrolling: the panel is its own scroll box with `overscroll-behavior:
 * contain`, and carries `data-lenis-prevent` so the smooth-scroll engine
 * leaves it alone. A wheel over the backdrop is cancelled outright — the
 * page does not move under the panel — and every wheel is stopped before it
 * reaches the window, where Lenis listens.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function AgentDrawer({
  agent,
  onClose,
  onMint,
  mintError,
}: {
  agent: AgencyAgent | null;
  onClose: () => void;
  onMint: (agent: AgencyAgent) => void;
  /** Set by the dashboard when the hand-off to /create could not happen. */
  mintError: string;
}) {
  // Portals need a document; render nothing until the client has one.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = agent !== null;

  useEffect(() => {
    if (!open || !mounted) return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    // Everything else on the page steps back.
    const madeInert: Element[] = [];
    for (const el of Array.from(document.body.children)) {
      if (el === overlay || el.hasAttribute("inert")) continue;
      el.setAttribute("inert", "");
      madeInert.push(el);
    }

    closeRef.current?.focus();

    const trapTab = (e: KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      // Focus on the panel itself (a click on plain copy puts it there)
      // counts as "no item": either direction wraps to an end.
      const onItem = active instanceof Node && active !== panel && panel.contains(active);
      if (e.shiftKey ? active === first || !onItem : active === last || !onItem) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab") {
        trapTab(e);
      }
    };
    const onWheel = (e: WheelEvent) => {
      const panel = panelRef.current;
      const inPanel = panel && e.target instanceof Node && panel.contains(e.target);
      if (!inPanel) e.preventDefault();
      // Lenis listens on the window. The panel scrolls itself natively.
      e.stopPropagation();
    };

    window.addEventListener("keydown", onKey);
    overlay.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", onKey);
      overlay.removeEventListener("wheel", onWheel);
      for (const el of madeInert) el.removeAttribute("inert");
    };
  }, [open, mounted, onClose]);

  if (!mounted || !agent) return null;
  const a = agent;
  const titleId = `agent-title-${a.slug}`;

  return createPortal(
    <div ref={overlayRef} className="fixed inset-0 z-overlay flex justify-end">
      {/* Backdrop — a wash of ink. Pointer-only: the Close button and Escape
          are the accessible paths, so this is deliberately not focusable. */}
      <div aria-hidden="true" onClick={onClose} className="drawer-backdrop absolute inset-0 bg-ink/70 backdrop-blur-[2px]" />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        data-lenis-prevent
        className="drawer-panel relative flex h-full w-full max-w-[34rem] flex-col overflow-y-auto border-l border-rule bg-plate shadow-deep [scroll-padding-top:5rem]"
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
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => onMint(a)}
                className="strike-btn assay px-5 py-3 text-center normal-case tracking-[0.08em]"
              >
                Mint this agent
              </button>
              <a
                href={sourceUrlOf(a)}
                target="_blank"
                rel="noopener noreferrer"
                className="strike-ghost assay px-5 py-3 text-center normal-case tracking-[0.08em]"
              >
                Read the full spec on GitHub
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
            {mintError && (
              <p role="alert" className="border border-danger/50 bg-danger/10 px-4 py-3 text-sm text-danger">
                {mintError}
              </p>
            )}
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
                        <span className="sr-only"> (opens in a new tab)</span>
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

          <p className="break-all font-mono text-xs text-dim">{a.path}</p>
        </div>
      </aside>
    </div>,
    document.body
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 bg-plate p-3">
      <dt className="assay">{label}</dt>
      <dd className="break-words text-paper">{value}</dd>
    </div>
  );
}
