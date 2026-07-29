"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { HeroVideo } from "@/components/site/HeroVideo";
import { MaskedLines } from "@/components/motion/MaskedLines";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";
import { useMagnetic } from "@/components/motion/hooks";
import { motion } from "@/lib/design/tokens";

/** Rotating placeholders — real jobs, not slogans. */
const PROMPTS = [
  "answer my store's calls and take pickup orders",
  "review my bank statements and flag anything odd",
  "write cold emails for my design studio",
  "handle booking questions for my clinic",
  "read contracts and tell me what to push back on",
];

export function Hero({ agentCount }: { agentCount: number }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [strike, setStrike] = useState(0);
  const [placeholder, setPlaceholder] = useState(PROMPTS[0]);

  const rootRef = useRef<HTMLElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const buttonRef = useMagnetic<HTMLButtonElement>(0.2);

  /** Cycle the placeholder so the box always suggests something concrete. */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % PROMPTS.length;
      setPlaceholder(PROMPTS[i]);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  /** Load choreography: the seal settles, then type rises, then controls. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      // Reveal everything the timeline would have revealed — including the
      // seal, which is animated by ref rather than by attribute.
      gsap.set(root.querySelectorAll("[data-enter]"), { opacity: 1, y: 0 });
      gsap.set(sealRef.current, { opacity: 1, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: motion.gsapEase } });

      tl.fromTo(
        sealRef.current,
        { opacity: 0, scale: 0.86 },
        { opacity: 1, scale: 1, duration: 1.5 },
        0.15
      )
        .fromTo(
          root.querySelectorAll("[data-enter='kicker']"),
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: motion.duration.settle },
          0.1
        )
        // Headline reveals itself (MaskedLines owns that timeline) — this gap
        // is deliberate so the two don't collide.
        .fromTo(
          root.querySelectorAll("[data-enter='body']"),
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: motion.duration.settle, stagger: 0.09 },
          0.95
        )
        .fromTo(
          root.querySelectorAll("[data-enter='cue']"),
          { opacity: 0 },
          { opacity: 1, duration: motion.duration.settle },
          1.5
        );
    }, root);

    return () => ctx.revert();
  }, []);

  function mint() {
    const value = text.trim();
    if (!value) {
      // Nothing typed: draw attention to the field rather than failing silently.
      fieldRef.current?.classList.add("striking");
      setTimeout(() => fieldRef.current?.classList.remove("striking"), 700);
      (fieldRef.current?.querySelector("input") as HTMLInputElement | null)?.focus();
      return;
    }
    setStrike((n) => n + 1);
    fieldRef.current?.classList.add("striking");
    sessionStorage.setItem("agentmint.pendingDescription", value);
    // Let the strike land before leaving — the moment is the point.
    setTimeout(() => router.push("/create"), 480);
  }

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden"
      aria-labelledby="hero-title"
    >
      <div className="plate-light" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-sheet grid-cols-1 items-center gap-10 px-6 pb-20 pt-16 lg:grid-cols-[1fr_1.18fr] lg:gap-12 lg:pb-28 lg:pt-24">
        {/* ---------------- left: the argument ---------------- */}
        <div className="flex flex-col gap-7">
          <p data-enter="kicker" className="assay flex flex-wrap items-center gap-3 opacity-0">
            <span className="text-mint">Live</span>
            <span aria-hidden="true">·</span>
            <span>{agentCount} agents ready to strike</span>
            <span aria-hidden="true">·</span>
            <span>or describe your own</span>
          </p>

          <MaskedLines
            as="h1"
            className="text-display max-w-[13ch]"
            delay={0.35}
            stagger={0.09}
          >
            Describe the work. Mint the agent.
          </MaskedLines>

          <p
            data-enter="body"
            className="max-w-[46ch] text-lg leading-relaxed text-muted opacity-0"
          >
            Tell AgentMint what you need in plain English. It builds a working AI
            agent you can test right here — before you pay for anything.
          </p>

          {/* The describe field. This is real: it mints. */}
          <div data-enter="body" className="max-w-[42rem] opacity-0">
            <div
              ref={fieldRef}
              className="struck flex flex-col gap-3 p-3 transition-colors duration-300 ease-struck focus-within:border-mint-deep sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 px-2">
                <span className="assay hidden shrink-0 text-mint sm:block" aria-hidden="true">
                  I need an agent to
                </span>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && mint()}
                  placeholder={placeholder}
                  aria-label="Describe the agent you need"
                  className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-ink outline-none placeholder:text-dim"
                />
              </div>
              <button
                ref={buttonRef}
                type="button"
                onClick={mint}
                className="strike-btn assay shrink-0 px-7 py-3"
              >
                Strike it
              </button>
            </div>
            <p className="assay mt-3 normal-case tracking-normal text-dim">
              <span className="text-muted">Free to test.</span> No card, no account,
              nothing to install.
            </p>
          </div>

          <div data-enter="body" className="flex flex-wrap items-center gap-5 opacity-0">
            <a
              href="#collection"
              className="group inline-flex items-center gap-2 text-[15px] font-medium text-ink transition-colors hover:text-mint"
            >
              Browse the collection
              <span
                aria-hidden="true"
                className="transition-transform duration-200 ease-struck group-hover:translate-x-1"
              >
                →
              </span>
            </a>
            <span className="rule-line hidden h-px w-16 sm:block" aria-hidden="true" />
            <span className="assay normal-case tracking-normal text-dim">
              Every agent carries its own engraved mark
            </span>
          </div>
        </div>

        {/* ---------------- right: the film ---------------- */}
        <div className="relative order-first flex flex-col items-center lg:order-none">
          {/* No overflow-hidden here: the plate's cast shadow has to fall
              outside its own box or it stops looking like a shadow. */}
          <div
            ref={sealRef}
            className="relative w-[min(92vw,34rem)] opacity-0 lg:w-full lg:max-w-none"
          >
            <HeroVideo className="w-full" />
          </div>
        </div>
      </div>

      {/* ---------------- scroll cue ---------------- */}
      <div
        data-enter="cue"
        className="relative mx-auto flex max-w-sheet items-center gap-4 px-6 pb-10 opacity-0"
      >
        <span className="rule-line h-px flex-1" aria-hidden="true" />
        <span className="assay cue">Scroll</span>
      </div>
    </section>
  );
}
