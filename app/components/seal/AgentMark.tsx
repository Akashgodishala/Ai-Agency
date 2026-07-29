"use client";

import { markFor, CARTOUCHE } from "@/lib/design/marks";

/**
 * An agent's engraved identity.
 *
 * The cartouche seats like a die dropping into its collar; the glyph engraves
 * itself stroke by stroke. Both effects are pure CSS driven by a parent
 * `.group` hover, so a wall of fifty of these costs nothing to animate.
 */
export function AgentMark({
  templateId,
  size = 56,
  className = "",
  tone = "ink",
}: {
  templateId: string;
  size?: number;
  className?: string;
  /** "ink" for rest states, "mint" where the mark is already the focus. */
  tone?: "ink" | "mint";
}) {
  const m = markFor(templateId);

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`mark ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <path className="mark-cart" d={CARTOUCHE[m.world]} />
      <g className={`mark-glyph ${tone === "mint" ? "is-mint" : ""}`}>
        {m.g.map((d, i) => (
          <path key={i} d={d} style={{ ["--i" as string]: i }} />
        ))}
      </g>
      {m.dots?.map(([cx, cy, r], i) => (
        <circle key={i} className="mark-dot" cx={cx} cy={cy} r={r} />
      ))}
    </svg>
  );
}
