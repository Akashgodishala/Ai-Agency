"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/components/motion/gsap";
import { useEffect } from "react";

/**
 * The brand statement.
 *
 * No image, no card, no icon — the typography is the image. The line arrives
 * set wide and loose and settles tight as you scroll, like a caption coming
 * into focus. Scrubbed, so the visitor controls it.
 */
export function Statement() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const line = el.querySelector<HTMLElement>("[data-line]");
    const sub = el.querySelector<HTMLElement>("[data-sub]");
    const rule = el.querySelector<HTMLElement>("[data-rule]");
    if (!line) return;

    if (prefersReducedMotion()) {
      gsap.set([line, sub, rule], { opacity: 1, letterSpacing: "-0.02em", scaleX: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        line,
        { letterSpacing: "0.16em", opacity: 0.28 },
        {
          letterSpacing: "-0.022em",
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 78%", end: "center 52%", scrub: 0.9, invalidateOnRefresh: true },
        }
      );
      gsap.fromTo(
        rule,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 70%", end: "center 55%", scrub: 0.9, invalidateOnRefresh: true },
        }
      );
      gsap.fromTo(
        sub,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 58%", once: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-ink border-t border-rule py-28 lg:py-40"
      aria-labelledby="statement"
    >
      <div className="mx-auto max-w-sheet px-6">
        <p className="assay">The whole idea</p>

        <h2
          id="statement"
          data-line
          className="mt-8 max-w-[17ch] font-display text-[clamp(2.2rem,6vw,5rem)] leading-[1.02] opacity-30"
        >
          You run the business. Your agent runs the busywork.
        </h2>

        <div
          data-rule
          className="rule-line mt-12 origin-left"
          aria-hidden="true"
        />

        <p data-sub className="mt-8 max-w-measure text-lg leading-relaxed text-muted opacity-0">
          Not another dashboard to learn. Not a tool that needs an operator. You
          tell it what the job is, the way you'd tell a person — and then you get
          on with the work only you can do.
        </p>
      </div>
    </section>
  );
}
