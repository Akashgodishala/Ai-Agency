"use client";

import { useEffect, useState } from "react";
import type { AgencyDivision } from "@/lib/agency";

/**
 * Agents per division, as a sorted bar list that is also the division filter.
 *
 * One series, one hue: every bar is the accent, and a selected division is
 * told apart by the others stepping back, not by a second colour. Marks are
 * thin, the track is a hairline, and the value sits at the tip — the count is
 * what you came to read, so it is written rather than left to the eye.
 */
export function DivisionBars({
  divisions,
  active,
  onPick,
}: {
  divisions: readonly AgencyDivision[];
  /** The selected division id, or null when every division is shown. */
  active: string | null;
  onPick: (id: string | null) => void;
}) {
  const sorted = [...divisions].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  const max = Math.max(1, ...sorted.map((d) => d.count));

  // Bars grow in on first paint. Reduced motion collapses the transition to
  // nothing via the global rule in globals.css, so they simply appear.
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      role="group"
      aria-label="Agents per division. Select a division to filter the roster."
      className="grid grid-cols-1 gap-x-12 gap-y-1 lg:grid-cols-2"
    >
      {sorted.map((d, i) => {
        const selected = active === d.id;
        const dimmed = active !== null && !selected;
        return (
          <button
            key={d.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onPick(selected ? null : d.id)}
            className={`group grid grid-cols-[9.5rem_1fr_2.5rem] items-center gap-3 py-1.5 text-left transition-colors duration-300 ease-struck sm:grid-cols-[11rem_1fr_2.5rem] ${
              dimmed ? "opacity-60 hover:opacity-100" : ""
            }`}
          >
            <span
              className={`truncate text-[0.86rem] transition-colors duration-300 ease-struck ${
                selected ? "text-paper" : "text-muted group-hover:text-paper"
              }`}
            >
              {d.label}
            </span>
            <span className="relative h-1.5 w-full overflow-hidden rounded-struck bg-rule">
              <span
                className={`absolute inset-y-0 left-0 block origin-left rounded-struck transition-transform duration-700 ease-struck ${
                  dimmed ? "bg-mint/40 group-hover:bg-mint" : "bg-mint"
                }`}
                style={{
                  width: `${(d.count / max) * 100}%`,
                  transform: grown ? "scaleX(1)" : "scaleX(0)",
                  transitionDelay: grown ? `${i * 30}ms` : "0ms",
                }}
              />
            </span>
            <span className="font-mono text-xs tabular-nums text-dim">{d.count}</span>
          </button>
        );
      })}
    </div>
  );
}
