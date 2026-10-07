"use client";

import { useRef } from "react";
import { divisionLabel, formatCount, groupLabel, type AgencyAgent } from "@/lib/agency";
import { AgencyMark } from "./AgencyMark";

/** One agent on the roster, presented as a struck plate. Opens the detail panel. */
export function AgentPlate({ agent: a, onOpen }: { agent: AgencyAgent; onOpen: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);

  /** Cursor-tracked rim light, the same trick the collection's plates use. */
  function onMove(e: React.PointerEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  }

  return (
    <button
      ref={ref}
      type="button"
      data-slug={a.slug}
      onPointerMove={onMove}
      onClick={onOpen}
      aria-label={`${a.name} — open details`}
      className="plate-in group relative flex h-full flex-col gap-4 bg-plate p-6 text-left transition-colors duration-300 ease-struck hover:bg-plate2 focus-visible:bg-plate2"
      style={
        {
          backgroundImage:
            "radial-gradient(340px circle at var(--mx,50%) var(--my,0%), rgb(var(--mint)/0.07), transparent 60%)",
        } as React.CSSProperties
      }
    >
      <div className="flex items-start justify-between gap-3">
        <AgencyMark name={a.name} division={a.division} size={54} />
        <span className="assay max-w-[55%] truncate border border-rule px-2.5 py-1 normal-case tracking-[0.08em]">
          {divisionLabel(a.division)}
          {a.group ? ` · ${groupLabel(a.group)}` : ""}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-display text-[1.3rem] leading-tight">{a.name}</h3>
        <p className="line-clamp-3 text-[0.9rem] leading-relaxed text-muted">{a.description}</p>
        {a.vibe && (
          <p className="line-clamp-2 font-display text-[0.98rem] italic leading-snug text-dim">
            {a.vibe}
          </p>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
        <span className="assay truncate">
          {a.tools.length > 0
            ? `${a.tools.length} tools · ${formatCount(a.words)} words`
            : `${a.headings.length} sections · ${formatCount(a.words)} words`}
        </span>
        <span className="assay flex shrink-0 items-center gap-1.5 normal-case tracking-[0.08em] text-mint">
          Open
          <span
            aria-hidden="true"
            className="transition-transform duration-200 ease-struck group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </div>
    </button>
  );
}
