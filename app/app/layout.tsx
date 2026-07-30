import type { Metadata } from "next";
import { Bodoni_Moda } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import "./globals.css";

/**
 * Type pairing for The Mint:
 *   Display — Bodoni Moda, a didone. Banknote engraving lineage; the face that
 *             makes the brand feel struck rather than shipped.
 *   Body    — Geist Sans. Neutral, modern, deliberately not Inter.
 *   Data    — Geist Mono, for assay marks and metadata.
 * All three are self-hosted at build time; no CDN, no layout shift.
 */
const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://agentmint-olive.vercel.app"),
  title: "AgentMint — describe the work, mint the agent",
  description:
    "Tell AgentMint what you need in plain English and it builds a working AI agent you can test before you pay. 50 ready-made agents, or describe your own.",
  openGraph: {
    title: "AgentMint — describe the work, mint the agent",
    description:
      "Describe what you need. Mint a working AI agent. Test it free before you pay.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <SmoothScroll />

        <a
          href="#main"
          className="assay sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:border focus:border-mint focus:bg-ground focus:px-4 focus:py-2 focus:normal-case focus:text-mint"
        >
          Skip to content
        </a>

        <Nav />

        <main id="main" className="flex-1">
          {children}
        </main>

        <footer className="border-t border-rule py-12">
          <div className="mx-auto flex max-w-sheet flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-display text-lg">
              AgentMint
              <span className="ml-3 align-middle text-sm text-muted">
                Describe the work. Mint the agent.
              </span>
            </p>
            <p className="assay">Early access · built on Claude</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
