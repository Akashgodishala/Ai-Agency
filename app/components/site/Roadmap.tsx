"use client";

import { useEffect, useRef, useState } from "react";
import { MaskedLines } from "@/components/motion/MaskedLines";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";
import { saveInterest } from "@/lib/store";

/**
 * The roadmap.
 *
 * Rendered in brass rather than mint — the palette itself separates "planned"
 * from "live", so nothing here can be mistaken for a shipped feature. A struck
 * line advances as you scroll and each milestone stamps into place.
 *
 * Waitlists are real: they record which capability someone wants, which is how
 * we decide build order.
 */
const MILESTONES = [
  {
    id: "publish",
    state: "next" as const,
    title: "Publishing",
    body: "Your agent gets a shareable link and a widget for your own website, so customers can reach it — not just you.",
  },
  {
    id: "plans",
    state: "planned" as const,
    title: "Plans and subscriptions",
    body: "Monthly and yearly, with a free tier that stays genuinely useful. Checkout opens here.",
  },
  {
    id: "sms",
    state: "planned" as const,
    title: "Texts and payment links",
    body: "Your agent sends order-ready notifications and pay-by-link texts to your customers automatically.",
  },
  {
    id: "voice",
    state: "planned" as const,
    title: "Voice agents",
    body: "Your agent answers your real business line — takes the order, answers the question, hands the hard calls to you.",
  },
];

export function Roadmap() {
  const ref = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const [joined, setJoined] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const stops = el.querySelectorAll<HTMLElement>("[data-stop]");

    if (prefersReducedMotion()) {
      gsap.set(lineRef.current, { scaleY: 1 });
      gsap.set(stops, { opacity: 1, x: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 68%", end: "bottom 78%", scrub: 0.7 },
        }
      );
      stops.forEach((stop) => {
        gsap.fromTo(
          stop,
          { opacity: 0, x: -18 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: { trigger: stop, start: "top 82%", once: true },
          }
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  function join(id: string, title: string, email: string) {
    if (!email.trim()) return;
    saveInterest({ agentId: id, agentName: title, email: email.trim(), at: new Date().toISOString() });
    setJoined(id);
  }

  return (
    <section ref={ref} className="border-t border-rule py-20 lg:py-28" aria-labelledby="roadmap-title">
      <div className="mx-auto max-w-sheet px-6">
        <div className="flex flex-col gap-4">
          <p className="assay text-brass">In development · not yet live</p>
          <MaskedLines as="h2" id="roadmap-title" className="text-title max-w-[18ch]" play="scroll">
            Where this goes next.
          </MaskedLines>
          <p className="max-w-measure text-muted">
            In build order. Join a list and you're first in line — and you tell us
            what to build faster.
          </p>
        </div>

        <div className="relative mt-14 pl-10 sm:pl-14">
          {/* The struck line the milestones hang from. */}
          <span className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-rule sm:left-[11px]" aria-hidden="true" />
          <span
            ref={lineRef}
            className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px origin-top bg-brass sm:left-[11px]"
            style={{ transform: "scaleY(0)" }}
            aria-hidden="true"
          />

          <ol className="flex flex-col gap-12">
            {MILESTONES.map((m) => (
              <li key={m.id} data-stop className="relative opacity-0">
                <span
                  className={`absolute -left-10 top-1.5 grid h-4 w-4 place-items-center rounded-full border sm:-left-14 ${
                    m.state === "next" ? "border-brass bg-brass/25" : "border-rule bg-ground"
                  }`}
                  aria-hidden="true"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${m.state === "next" ? "bg-brass" : "bg-dim"}`} />
                </span>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-[1.45rem]">{m.title}</h3>
                    <span
                      className={`assay border px-2 py-0.5 ${
                        m.state === "next" ? "border-brass text-brass" : "border-rule text-dim"
                      }`}
                    >
                      {m.state === "next" ? "Building now" : "Planned"}
                    </span>
                  </div>
                  <p className="max-w-measure text-[0.95rem] leading-relaxed text-muted">{m.body}</p>

                  {joined === m.id ? (
                    <p className="mt-1 text-sm font-medium text-mint">You're on the list.</p>
                  ) : (
                    <form
                      className="mt-2 flex max-w-md gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.elements.namedItem("email") as HTMLInputElement;
                        join(m.id, m.title, input.value);
                      }}
                    >
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="you@email.com"
                        aria-label={`Email for ${m.title} updates`}
                        className="min-w-0 flex-1 border border-rule bg-plate px-3.5 py-2 text-sm text-ink outline-none transition-colors duration-200 ease-struck placeholder:text-dim focus:border-brass"
                      />
                      <button
                        type="submit"
                        className="assay shrink-0 border border-brass px-4 py-2 text-brass transition-colors duration-200 ease-struck hover:bg-brass hover:text-ground"
                      >
                        Notify me
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
