"use client";

import { MaskedLines } from "@/components/motion/MaskedLines";
import { useReveal } from "@/components/motion/hooks";

/**
 * Describe it → Mint it → Make it yours.
 *
 * Numbered because this genuinely is a sequence: each step depends on the one
 * before it. Presented as three struck plates on a single engraved rule rather
 * than icon cards — the rule is what makes them read as one process.
 */
const BEATS = [
  {
    n: "01",
    title: "Describe it",
    body: "Say what you need in ordinary words — the way you'd explain it to a new hire. No settings, no prompt writing, no jargon.",
    detail: "“Answer my store's calls and take pickup orders.”",
  },
  {
    n: "02",
    title: "Mint it",
    body: "AgentMint asks two or three quick questions, then builds the agent: how it speaks, what it knows, and the lines it must never cross.",
    detail: "Struck in under a minute, with its own engraved mark.",
  },
  {
    n: "03",
    title: "Make it yours",
    body: "Test it as long as you like. Teach it your information, adjust its manner in plain English, and keep it when it's right.",
    detail: "Free to test. Nothing to install.",
  },
];

export function Process() {
  const ref = useReveal<HTMLDivElement>({ selector: "[data-beat]", stagger: 0.11 });

  return (
    <section className="border-t border-rule py-20 lg:py-28" aria-labelledby="process-title">
      <div className="mx-auto max-w-sheet px-6">
        <div className="flex flex-col gap-4">
          <p className="assay">How it works</p>
          <MaskedLines as="h2" className="text-title max-w-[16ch]" play="scroll">
            Three steps, and none of them are technical.
          </MaskedLines>
        </div>

        <div
          ref={ref}
          className="mt-14 grid grid-cols-1 gap-px border-t border-rule bg-rule md:grid-cols-3"
        >
          {BEATS.map((b) => (
            <article
              key={b.n}
              data-beat
              className="group relative flex flex-col gap-4 bg-ink p-8 opacity-0 transition-colors duration-300 ease-struck hover:bg-plate"
            >
              {/* The mark bleeds up over the rule, tying the beats to one line. */}
              <span
                className="absolute -top-[9px] left-8 bg-ink px-2 font-mono text-[11px] tracking-[0.2em] text-mint"
                aria-hidden="true"
              >
                {b.n}
              </span>
              <h3 className="mt-3 font-display text-[1.6rem]">{b.title}</h3>
              <p className="text-[0.95rem] leading-relaxed text-muted">{b.body}</p>
              <p className="mt-auto border-l border-mint-deep pl-4 text-[0.88rem] italic leading-relaxed text-dim">
                {b.detail}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
