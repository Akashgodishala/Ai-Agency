"use client";

import { CARTOUCHE, type WorldKey } from "@/lib/design/marks";
import { initials } from "@/lib/agency";

/**
 * An agency agent's engraved monogram.
 *
 * The fifty house agents each have a hand-drawn glyph (lib/design/marks.ts).
 * Two hundred and eighty more cannot, so these are struck procedurally: the
 * cartouche says which family of division the agent belongs to, the initials
 * say who it is. Same 24-unit grid, same stroke, same hover engraving — driven
 * by the parent `.group`, like every other mark on the site.
 */

/** Divisions share the six cartouches by what kind of work they do. */
const WORLD_OF_DIVISION: Record<string, WorldKey> = {
  finance: "money",
  sales: "money",
  "paid-media": "money",
  healthcare: "home",
  support: "home",
  academic: "home",
  engineering: "work",
  product: "work",
  "project-management": "work",
  testing: "work",
  marketing: "market",
  research: "market",
  specialized: "trade",
  gis: "trade",
  "spatial-computing": "trade",
  "game-development": "trade",
  design: "life",
  security: "life",
};

export function worldOfDivision(division: string): WorldKey {
  return WORLD_OF_DIVISION[division] ?? "trade";
}

export function AgencyMark({
  name,
  division,
  size = 56,
  className = "",
  tone = "ink",
}: {
  name: string;
  division: string;
  size?: number;
  className?: string;
  /** "ink" for rest states, "mint" where the mark is already the focus. */
  tone?: "ink" | "mint";
}) {
  const text = initials(name);
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`mark ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <path className="mark-cart" d={CARTOUCHE[worldOfDivision(division)]} />
      <text
        className={`mark-text ${tone === "mint" ? "is-mint" : ""}`}
        x="12"
        y="12.4"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={text.length > 1 ? 8.2 : 9.5}
      >
        {text}
      </text>
    </svg>
  );
}
