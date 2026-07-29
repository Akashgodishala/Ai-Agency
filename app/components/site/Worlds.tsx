"use client";

import { useEffect, useRef } from "react";
import { WORLDS } from "@/lib/worlds";
import { SealCanvas } from "@/components/seal/SealCanvas";
import { MaskedLines } from "@/components/motion/MaskedLines";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";

/**
 * Agent worlds — the second and last pinned section on the site.
 *
 * The page holds still and the territories travel sideways, so five capability
 * zones read as five distinct places rather than five more cards. A progress
 * rail shows how far through you are, because horizontal scroll without a
 * position indicator is disorienting.
 *
 * Falls back to ordinary vertical stacking on touch and under reduced motion:
 * hijacking scroll on a phone is hostile, and this content reads fine as a list.
 */
export function Worlds() {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!root || !pin || !track) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.innerWidth < 900;
    if (prefersReducedMotion() || coarse || narrow) return;

    const ctx = gsap.context(() => {
      const distance = () => track.scrollWidth - window.innerWidth;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          // Scroll length follows content width, so pacing stays even whatever
          // the viewport.
          end: () => `+=${distance() + window.innerHeight * 0.6}`,
          scrub: 0.9,
          // Pin the inner wrapper, never the <section> itself. ScrollTrigger
          // re-parents whatever it pins into a .pin-spacer, and React still
          // believes the node it rendered is a direct child of <main>; on
          // navigation it would call removeChild against the wrong parent and
          // crash the whole page. Keeping the spacer inside the section means
          // React only ever removes the section, whose parent never moves.
          pin: pin,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(track, { x: () => -distance(), ease: "none" }, 0);
      if (railRef.current) {
        tl.fromTo(railRef.current, { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      // Opaque and above the collection's sticky filter bar: while this section
      // is pinned it travels over the top of the one before it.
      className="relative z-30 overflow-hidden border-t border-rule bg-ground py-20 lg:h-screen lg:py-0"
      aria-labelledby="worlds-title"
    >
      <div ref={pinRef} className="h-full w-full">
      <div className="mx-auto flex h-full max-w-sheet flex-col justify-center px-6">
        <div className="shrink-0 lg:pt-24">
          <p className="assay">Agent worlds</p>
          <MaskedLines
            as="h2"
            id="worlds-title"
            className="text-title mt-3 max-w-[20ch]"
            play="scroll"
          >
            Five kinds of work. Pick the one that's eating your week.
          </MaskedLines>
        </div>

        {/* Horizontal on desktop, an honest vertical list everywhere else. */}
        <div className="mt-10 lg:mt-14 lg:overflow-hidden">
          <div
            ref={trackRef}
            className="flex flex-col gap-6 lg:w-max lg:flex-row lg:gap-8 lg:will-change-transform"
          >
            {WORLDS.map((w) => (
              <article
                key={w.id}
                className="struck flex flex-col gap-4 p-6 lg:h-[25rem] lg:w-[32rem] lg:shrink-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[11px] tracking-[0.2em] text-mint">
                      {w.mark}
                    </span>
                    <h3 className="font-display text-[1.7rem] leading-tight">{w.name}</h3>
                  </div>
                  <div className="h-11 w-11 shrink-0 opacity-80">
                    <SealCanvas
                      text={`${w.name} ${w.line}`}
                      animate={false}
                      transparent
                      size={240}
                      steps={760}
                      className="h-full w-full"
                    />
                  </div>
                </div>

                <p className="font-display text-[1.05rem] italic text-ink/90">{w.line}</p>
                <p className="line-clamp-3 text-[0.88rem] leading-relaxed text-muted">{w.body}</p>

                {/* A real exchange, not a screenshot mock. */}
                <div className="mt-auto flex flex-col gap-1.5 border-t border-rule pt-3.5">
                  {w.exchange.map((m, i) => (
                    <p
                      key={i}
                      className={`max-w-[93%] px-2.5 py-1.5 text-[0.78rem] leading-snug ${
                        m.from === "them"
                          ? "self-start border border-rule bg-ground text-muted"
                          : "self-end bg-mint-deep/25 text-ink"
                      }`}
                    >
                      {m.text}
                    </p>
                  ))}
                </div>

                <p className="assay truncate normal-case tracking-[0.06em] text-dim">
                  {w.agents.join(" · ")}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* Progress rail — horizontal motion needs a position indicator. */}
        <div className="mt-8 hidden items-center gap-4 lg:flex lg:pb-16">
          <span className="assay">Drag through with your scroll</span>
          <span className="relative h-px flex-1 bg-rule">
            <span
              ref={railRef}
              className="absolute inset-0 origin-left bg-mint"
              style={{ transform: "scaleX(0)" }}
            />
          </span>
          <span className="assay tabular-nums">{WORLDS.length} worlds</span>
        </div>
      </div>
      </div>
    </section>
  );
}
