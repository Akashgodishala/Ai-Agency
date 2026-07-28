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
        ink: "rgb(var(--ink) / <alpha-value>)",
        plate: "rgb(var(--plate) / <alpha-value>)",
        plate2: "rgb(var(--plate2) / <alpha-value>)",
        rule: "rgb(var(--rule) / <alpha-value>)",
        paper: "rgb(var(--paper) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        dim: "rgb(var(--dim) / <alpha-value>)",
        mint: "rgb(var(--mint) / <alpha-value>)",
        "mint-deep": "rgb(var(--mint-deep) / <alpha-value>)",
        brass: "rgb(var(--brass) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Didot", "Bodoni MT", "Georgia", "serif"],
        sans: ["var(--font-geist-sans)", "-apple-system", "Helvetica", "Arial", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SF Mono", "Menlo", "monospace"],
      },
      fontSize: {
        // A didone type scale: big jumps at the top, tight steps in the body.
        display: ["clamp(3.1rem, 8.2vw, 7.4rem)", { lineHeight: "0.94", letterSpacing: "-0.024em" }],
        title: ["clamp(2rem, 4.4vw, 3.6rem)", { lineHeight: "1.04", letterSpacing: "-0.018em" }],
        head: ["clamp(1.4rem, 2.2vw, 1.9rem)", { lineHeight: "1.16", letterSpacing: "-0.01em" }],
      },
      borderRadius: {
        struck: "2px",
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
