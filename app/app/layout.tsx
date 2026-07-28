import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentMint — mint your own AI agent",
  description:
    "Describe what you need, and get your own working AI agent in minutes. No coding, no setup — just tell it what to do.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-40 border-b border-line bg-ground/85 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
            <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-semibold">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-40" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-mint" />
              </span>
              AgentMint
              <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                early access
              </span>
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              <Link href="/#gallery" className="text-muted hover:text-ink">
                Gallery
              </Link>
              <Link href="/agents" className="text-muted hover:text-ink">
                My agents
              </Link>
              <Link
                href="/#create"
                className="rounded-full bg-mint px-4 py-2 font-semibold text-white shadow-card hover:bg-mint-deep"
              >
                Mint an agent
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-line py-8 text-center text-sm text-muted">
          <p>
            <span className="font-display font-semibold text-ink">AgentMint</span> · describe it,
            mint it, make it yours.
          </p>
        </footer>
      </body>
    </html>
  );
}
