/**
 * ============================================================================
 * THE MINT — the entire AgentMint design system, in one file.
 * ============================================================================
 *
 * Direction: a mint is where value gets struck. The visual language is coinage
 * and banknote engraving — guilloché relief, struck plate, beveled rims, assay
 * marks — in obsidian with one hot accent.
 *
 * REBRANDING LATER: change colours, type, spacing, or motion here and the whole
 * site follows. Nothing visual is hard-coded in components.
 *
 * The CSS custom properties that mirror these live in app/globals.css; keep the
 * two in step (this file is the source of truth for code that needs the values
 * as numbers — the WebGL scene and the guilloché engine).
 */

export const palette = {
  /** Obsidian ground — near-black with a cold green undertone, never pure #000. */
  ink: "#05080A",
  /** Struck plate: the raised surface things sit on. */
  plate: "#0B1113",
  /** Second surface, for nested cards. */
  plate2: "#121A1C",
  /** Hairline — engraved rule, not a border. */
  rule: "#1E292B",
  /** Struck highlight: primary type. Warm paper-white, never pure #FFF. */
  paper: "#E9EFEB",
  /** Secondary type. */
  muted: "#7A8C86",
  /** Tertiary type, labels at rest. */
  dim: "#4E5D58",
  /** The one hot accent. Used for live state, links, and the mint action. */
  mint: "#38E0A6",
  mintDeep: "#1F7A5C",
  /** Reserved exclusively for the strike and for "planned, not live" state. */
  brass: "#C9974A",
  /** Semantic, kept separate from the accent. */
  danger: "#E8836B",
} as const;

/** Numeric forms for Three.js (which wants hex numbers, not strings). */
export const paletteHex = {
  ink: 0x05080a,
  plate: 0x0b1113,
  paper: 0xe9efeb,
  mint: 0x38e0a6,
  brass: 0xc9974a,
  rim: 0x26332f,
} as const;

/**
 * Motion law: struck metal has mass. It starts fast, settles long, and never
 * overshoots — bounce and elastic are banned, they read as playful.
 */
export const motion = {
  /** The house easing curve. */
  ease: "cubic-bezier(0.16, 1, 0.3, 1)",
  gsapEase: "power3.out",
  /** For scrubbed, scroll-linked motion. */
  gsapEaseScrub: "none",
  duration: {
    micro: 0.18,
    quick: 0.34,
    settle: 0.72,
    long: 1.1,
  },
  /** Stagger between sibling reveals. */
  stagger: 0.06,
} as const;

export const layout = {
  maxWidth: 1240,
  gutter: 26,
  /** Comfortable measure for running text. */
  measure: "68ch",
} as const;

/** Named z-layers, so nothing fights over stacking. */
export const z = {
  scene: 0,
  content: 10,
  nav: 40,
  overlay: 60,
  cursor: 80,
} as const;
