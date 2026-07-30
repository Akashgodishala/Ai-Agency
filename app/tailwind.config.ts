import type { Config } from "tailwindcss";

/**
 * Tailwind maps semantic names onto the CSS custom properties defined in
 * app/globals.css, which mirror lib/design/tokens.ts. Components never name a
 * raw colour — so rebranding is a one-file change.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /** The ground everything is printed on. */
        ink: "rgb(var(--ink) / <alpha-value>)",
        plate: "rgb(var(--plate) / <alpha-value>)",
        plate2: "rgb(var(--plate2) / <alpha-value>)",
        rule: "rgb(var(--rule) / <alpha-value>)",
        /** Type. */
        paper: "rgb(var(--paper) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        dim: "rgb(var(--dim) / <alpha-value>)",
        mint: "rgb(var(--mint) / <alpha-value>)",
        "mint-deep": "rgb(var(--mint-deep) / <alpha-value>)",
        brass: "rgb(var(--brass) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",

        /**
         * Vocabulary from earlier builds of the app pages, mapped onto The Mint
         * so those screens inherit the system instead of rendering classes
         * Tailwind never generated. Prefer the names above in new code.
         */
        surface: "rgb(var(--plate) / <alpha-value>)",
        raised: "rgb(var(--plate2) / <alpha-value>)",
        line: "rgb(var(--rule) / <alpha-value>)",
        "mint-soft": "rgb(var(--mint-soft) / <alpha-value>)",
        amber: "rgb(var(--brass) / <alpha-value>)",
        /** The light-ground era called the page colour "ground". */
        ground: "rgb(var(--ink) / <alpha-value>)",
      },
      boxShadow: {
        card: "var(--lift-1)",
        raised: "var(--lift-2)",
        deep: "var(--lift-3)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Didot", "Bodoni MT", "Georgia", "serif"],
        sans: ["var(--font-geist-sans)", "-apple-system", "Helvetica", "Arial", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SF Mono", "Menlo", "monospace"],
      },
      fontSize: {
        /**
         * Letterpress confidence: the hero headline is set at poster scale, so
         * the first thing the page says is said at full volume. It tops out
         * around 3x the old display cap on a wide screen.
         */
        hero: ["clamp(3.2rem, 13.5vw, 15rem)", { lineHeight: "0.86", letterSpacing: "-0.038em" }],
        display: ["clamp(2.8rem, 7.6vw, 6.6rem)", { lineHeight: "0.92", letterSpacing: "-0.028em" }],
        title: ["clamp(2.1rem, 4.6vw, 3.8rem)", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
        head: ["clamp(1.4rem, 2.2vw, 1.95rem)", { lineHeight: "1.16", letterSpacing: "-0.01em" }],
      },
      borderRadius: {
        struck: "2px",
        /** The app screens' own radius, from the first build. */
        card: "4px",
      },
      maxWidth: {
        sheet: "1240px",
        measure: "68ch",
      },
      transitionTimingFunction: {
        struck: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
