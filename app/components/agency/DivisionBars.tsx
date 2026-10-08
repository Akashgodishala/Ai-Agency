"use client";

import type { AgencyDivision } from "@/lib/agency";

/**
 * Agents per division, as a sorted bar list that is also the division filter.
 *
 * One series, one hue: every bar is the accent. A selected division is told
 * apart by weight (its label is set bold) and by the other bars stepping back
 * to a lighter wash — never by fading their text, which would drop it under
 * the 4.5:1 floor the house keeps. Marks are thin, the track is a hairline,
 * and the value sits at the tip: the count is what you came to read.
 *
 * The bars grow in with a CSS animation rather than a state flip, so they are
 * already drawn in the server HTML and need no JavaScript to appear; under
 * reduced motion the global rule collapses both duration and delay.
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

  return (
    <div
      role="group"
      aria-label="Agents per division. Select a division to filter the roster."
      className="grid grid-cols-1 gap-x-12 gap-y-1 lg:grid-cols-2"
    >
      {sorted.map((d, i) => {
        const selected = active === d.id;
        const stepped = active !== null && !selected;
        return (
          <button
            key={d.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onPick(selected ? null : d.id)}
            className="group grid grid-cols-[9.5rem_1fr_2.5rem] items-center gap-3 py-1.5 text-left sm:grid-cols-[11rem_1fr_2.5rem]"
          >
            <span
              className={`truncate text-[0.86rem] transition-colors duration-300 ease-struck group-hover:text-paper group-focus-visible:text-paper ${
                selected ? "font-semibold text-paper" : stepped ? "text-dim" : "text-muted"
              }`}
            >
              {d.label}
            </span>
            <span className="relative h-1.5 w-full overflow-hidden rounded-struck bg-rule" aria-hidden="true">
              <span
                className={`bar-grow absolute inset-y-0 left-0 block origin-left rounded-struck transition-colors duration-300 ease-struck group-hover:bg-mint group-focus-visible:bg-mint ${
                  stepped ? "bg-mint/40" : "bg-mint"
                }`}
                style={{ width: `${(d.count / max) * 100}%`, animationDelay: `${i * 30}ms` }}
              />
            </span>
            <span className="font-mono text-xs tabular-nums text-dim">
              {d.count}
              <span className="sr-only"> agents</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
