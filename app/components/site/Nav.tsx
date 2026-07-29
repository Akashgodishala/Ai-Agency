"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * The nav thins as you scroll: at rest it sits transparent over the hero's
 * plate light; once you move it condenses onto an engraved rule.
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ease-struck ${
        scrolled
          ? "border-b border-rule bg-ground/88 backdrop-blur"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav
        className={`mx-auto flex max-w-sheet items-center justify-between px-6 transition-all duration-300 ease-struck ${
          scrolled ? "h-14" : "h-[4.5rem]"
        }`}
        aria-label="Main"
      >
        <Link href="/" className="group flex shrink-0 items-baseline gap-3">
          <span className="font-display text-xl tracking-tight">AgentMint</span>
          <span className="assay hidden text-dim transition-colors group-hover:text-mint md:inline">
            Early access
          </span>
        </Link>

        {/* Secondary links collapse below md; the mint action always stays. */}
        <div className="flex shrink-0 items-center gap-6">
          <Link
            href="/#collection"
            className="assay hidden normal-case tracking-[0.08em] text-muted transition-colors hover:text-ink md:inline"
          >
            Collection
          </Link>
          <Link
            href="/agents"
            className="assay whitespace-nowrap normal-case tracking-[0.08em] text-muted transition-colors hover:text-ink"
          >
            My agents
          </Link>
          <Link
            href="/#top"
            className="strike-btn assay whitespace-nowrap px-4 py-2 normal-case tracking-[0.08em]"
          >
            Mint
            <span className="hidden sm:inline">&nbsp;an agent</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
