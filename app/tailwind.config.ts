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
        /** The ground the page is printed on. */
        ground: "rgb(var(--ground) / <alpha-value>)",
        plate: "rgb(var(--plate) / <alpha-value>)",
        plate2: "rgb(var(--plate2) / <alpha-value>)",
        rule: "rgb(var(--rule) / <alpha-value>)",
        /** Primary type. */
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        dim: "rgb(var(--dim) / <alpha-value>)",
        mint: "rgb(var(--mint) / <alpha-value>)",
        "mint-deep": "rgb(var(--mint-deep) / <alpha-value>)",
        brass: "rgb(var(--brass) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",

        /**
         * Vocabulary from the first build of the app pages, mapped onto The
         * Mint so those screens inherit the system instead of rendering
         * classes Tailwind never generated. Prefer the names above in new code.
         */
        surface: "rgb(var(--plate) / <alpha-value>)",
        raised: "rgb(var(--plate2) / <alpha-value>)",
        line: "rgb(var(--rule) / <alpha-value>)",
        "mint-soft": "rgb(var(--mint-soft) / <alpha-value>)",
        amber: "rgb(var(--brass) / <alpha-value>)",
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
        // A didone type scale: big jumps at the top, tight steps in the body.
        display: ["clamp(3.1rem, 8.2vw, 7.4rem)", { lineHeight: "0.94", letterSpacing: "-0.024em" }],
        title: ["clamp(2rem, 4.4vw, 3.6rem)", { lineHeight: "1.04", letterSpacing: "-0.018em" }],
        head: ["clamp(1.4rem, 2.2vw, 1.9rem)", { lineHeight: "1.16", letterSpacing: "-0.01em" }],
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
