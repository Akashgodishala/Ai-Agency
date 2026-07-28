import type { Config } from "tailwindcss";

/**
 * AgentMint design tokens.
 * The palette is defined as CSS variables in app/globals.css (light + dark);
 * Tailwind maps semantic names onto those variables so every component stays
 * theme-aware without per-component dark: overrides.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ground: "rgb(var(--ground) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        raised: "rgb(var(--raised) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        mint: "rgb(var(--mint) / <alpha-value>)",
        "mint-deep": "rgb(var(--mint-deep) / <alpha-value>)",
        "mint-soft": "rgb(var(--mint-soft) / <alpha-value>)",
        amber: "rgb(var(--amber) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        card: "0 1px 2px rgb(0 0 0 / 0.04), 0 12px 32px -16px rgb(0 0 0 / 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
