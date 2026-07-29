/**
 * ============================================================================
 * THE MINT — the entire AgentMint design system, in one file.
 * ============================================================================
 *
 * Direction: a mint is where value gets struck. The visual language is coinage
 * and banknote engraving — guilloché relief, struck plate, beveled rims, assay
 * marks — rendered on warm white paper with molten orange as the only accent.
 *
 * On a light ground, depth comes from shadow and warmth, never from glow.
 *
 * REBRANDING LATER: change colours, type, spacing, or motion here and the whole
 * site follows. Nothing visual is hard-coded in components.
 *
 * The CSS custom properties that mirror these live in app/globals.css; keep the
 * two in step (this file is the source of truth for code that needs the values
 * as numbers — the WebGL scene and the guilloché engine).
 */

export const palette = {
  /** The ground the page is printed on. Warm white, never a clinical #FFF. */
  ground: "#FFF9F2",
  /** Struck plate: the raised surface things sit on. */
  plate: "#FFFFFF",
  /** Second surface, for nested cards. */
  plate2: "#FFF6ED",
  /** Hairline — engraved rule, not a border. */
  rule: "#EEDFD0",
  /** Primary type. Warm near-black, never pure #000. */
  ink: "#1A1206",
  /** Secondary type. */
  muted: "#6B5949",
  /** Tertiary type, labels at rest. */
  dim: "#9C8877",
  /**
   * The one hot accent — molten orange. Used for live state, links, and the
   * mint action. Named for the brand (AgentMint), not for the hue.
   */
  mint: "#F4560D",
  mintDeep: "#B23A05",
  /** Reserved exclusively for the strike and for "planned, not live" state. */
  brass: "#C08A2E",
  /** Semantic, kept separate from the accent. */
  danger: "#C0392B",
} as const;

/** Numeric forms for Three.js (which wants hex numbers, not strings). */
export const paletteHex = {
  ground: 0xfff9f2,
  plate: 0xffffff,
  ink: 0x1a1206,
  mint: 0xf4560d,
  brass: 0xc08a2e,
  rim: 0xe4cdb6,
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
