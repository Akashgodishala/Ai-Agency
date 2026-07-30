/**
 * ============================================================================
 * THE MINT — the entire AgentMint design system, in one file.
 * ============================================================================
 *
 * Direction: a banknote engraver's studio at night. Ink black ground, cream
 * paper type, one molten-orange accent like metal caught mid-strike. Depth
 * comes from engraved line and from heat, never from a gradient wash.
 *
 * The rule that keeps this coherent: no component may name a raw colour.
 * Everything below is mirrored as CSS custom properties in app/globals.css and
 * consumed through Tailwind's semantic names. Change a value here and in the
 * `:root` block and the whole site follows — rebranding stays a two-file edit.
 *
 * This file is the source of truth for code that needs the values as data
 * rather than as CSS: the guilloché engraving engine draws to a canvas and has
 * to be handed real colour strings.
 */

export const palette = {
  /** The ground everything is printed on. Ink black, warmed a hair off #000. */
  ink: "#0A0A0A",
  /** Raised surface — a plate lying on the ink. */
  plate: "#141312",
  /** Second surface, for nested cards. */
  plate2: "#1B1A18",
  /** Hairline. An engraved rule, not a border. */
  rule: "#2C2926",

  /** Primary type. Cream paper stock, never a clinical #FFF. */
  paper: "#F2EDE4",
  /** Secondary type — running body copy. */
  muted: "#B0A594",
  /** Tertiary type: assay labels, metadata, captions. */
  dim: "#8A8175",

  /**
   * The one hot accent — molten orange, the moment the die meets the blank.
   * Lifted from the light-ground brand orange (#F4560D) so it still clears
   * WCAG AA as text on the ink ground; the darker original does not.
   */
  mint: "#FF6B1A",
  /** The same heat, cooled — for gradients and pressed states. */
  mintDeep: "#C2450A",
  /** Reserved for the strike itself and for "planned, not live". */
  brass: "#C9A227",
  /** Semantic, kept away from the accent so errors never read as brand. */
  danger: "#E2564A",
} as const;

/**
 * Colours the guilloché engine draws with. It renders to a 2D canvas and needs
 * literal strings, so these exist to stop `guilloche.ts` inventing its own.
 */
export const engraving = {
  /** The blank the seal is struck into. */
  plateHigh: "#1E1C19",
  plateMid: "#141312",
  plateLow: "#0C0B0A",
  /** The turned rim, catching the light. */
  rimLight: "#4A423A",
  rimDark: "#221F1C",
  /** The engraved line itself. */
  line: "#FF6B1A",
  /** Heat, during a strike. */
  warm: "#C9A227",
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
  /** How long the strike preloader is allowed to hold the page. */
  preloaderMs: 1500,
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
  preloader: 90,
} as const;
