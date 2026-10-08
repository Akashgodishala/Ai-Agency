"use client";

import { useRef } from "react";
import { divisionLabel, formatCount, groupLabel, type AgencyAgent } from "@/lib/agency";
import { AgencyMark } from "./AgencyMark";

/**
 * One agent on the roster, presented as a struck plate.
 *
 * The plate is an <article> with a real heading and real copy; the control is
 * a button stretched invisibly over it. That keeps the whole card clickable
 * while the name stays a heading and the description stays readable to
 * assistive tech — a button wrapping all of it would flatten them into one
 * label. The button is named by the heading and described by the summary.
 */
export function AgentPlate({
  agent: a,
  index,
  onOpen,
}: {
  agent: AgencyAgent;
  /** Position in the visible list; lets "show more" hand focus to the first new plate. */
  index: number;
  /** Receives the button that was activated, so focus can return to it. */
  onOpen: (opener: HTMLElement) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const titleId = `plate-${a.slug}`;
  const descId = `plate-${a.slug}-desc`;

  /** Cursor-tracked rim light, the same trick the collection's plates use. */
  function onMove(e: React.PointerEvent<HTMLElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  }
  function onLeave() {
    ref.current?.style.removeProperty("--mx");
    ref.current?.style.removeProperty("--my");
  }

  return (
    <article
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="plate-in group relative flex h-full scroll-mt-[13rem] flex-col gap-4 bg-plate p-6 transition-colors duration-300 ease-struck focus-within:bg-plate2 hover:bg-plate2"
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
        <h3 id={titleId} className="font-display text-[1.3rem] leading-tight">
          {a.name}
        </h3>
        <p id={descId} className="line-clamp-3 text-[0.9rem] leading-relaxed text-muted">
          {a.description}
        </p>
        {a.vibe && (
          <p className="line-clamp-2 font-display text-[0.98rem] italic leading-snug text-muted">
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
        <span
          aria-hidden="true"
          className="assay flex shrink-0 items-center gap-1.5 normal-case tracking-[0.08em] text-mint"
        >
          Open
          <span className="transition-transform duration-200 ease-struck group-focus-within:translate-x-1 group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>

      {/* The control, laid over the whole plate. Last in source order so it
          paints above the copy without needing a stacking index. */}
      <button
        type="button"
        data-slug={a.slug}
        data-plate-index={index}
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={(e) => onOpen(e.currentTarget)}
        className="absolute inset-0 focus-visible:[outline-offset:-3px]"
      />
    </article>
  );
}
