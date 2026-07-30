"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEMPLATES, instantiateTemplate } from "@/lib/templates";
import { saveAgent, listAgents } from "@/lib/store";
import { AgentMark } from "@/components/seal/AgentMark";
import { MaskedLines } from "@/components/motion/MaskedLines";
import { useReveal } from "@/components/motion/hooks";

/**
 * The wall of fifty — the moment the catalogue stops being a list and becomes
 * an arsenal.
 *
 * Every agent's mark, engraved into the wall at once. Hovering one lifts it and
 * dims the other forty-nine, so the wall focuses around wherever you look. The
 * name of whatever you're pointing at reads out in the corner, large.
 */
export function TheFifty() {
  const router = useRouter();
  // Same reveal hook the rest of the page uses — proven, and it never leaves
  // content stranded at opacity 0 if a trigger misfires.
  const rootRef = useReveal<HTMLElement>({ selector: "[data-m]", stagger: 0.016, y: 22 });
  const [focus, setFocus] = useState<number | null>(null);

  function grab(index: number) {
    const t = TEMPLATES[index];
    const existing = listAgents().find((a) => a.createdFrom === t.templateId);
    if (existing) {
      router.push(`/playground/${existing.id}`);
      return;
    }
    const config = instantiateTemplate(t);
    if (saveAgent(config)) router.push(`/playground/${config.id}`);
  }

  const active = focus === null ? null : TEMPLATES[focus];

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden border-t border-rule py-28 lg:py-40"
      aria-labelledby="fifty-title"
    >
      <div className="mx-auto max-w-sheet px-6">
        <div className="flex flex-col gap-4">
          <p className="assay">The workforce</p>
          <MaskedLines as="h2" id="fifty-title" className="text-display max-w-[16ch]" play="scroll">
            Fifty tools. Every one of them struck.
          </MaskedLines>
        </div>

        {/* The wall */}
        <div
          className="mt-12 grid grid-cols-4 gap-x-3 gap-y-7 sm:grid-cols-6 lg:grid-cols-10 lg:gap-x-4 lg:gap-y-9"
          onMouseLeave={() => setFocus(null)}
        >
          {TEMPLATES.map((t, i) => {
            const dimmed = focus !== null && focus !== i;
            return (
              <button
                key={t.templateId}
                data-m
                type="button"
                onClick={() => grab(i)}
                onMouseEnter={() => setFocus(i)}
                onFocus={() => setFocus(i)}
                onBlur={() => setFocus(null)}
                aria-label={`${t.name} — ${t.tagline}`}
                className={`group flex flex-col items-center gap-2.5 opacity-0 transition-transform duration-500 ease-struck ${
                  dimmed ? "!opacity-30" : ""
                } ${focus === i ? "-translate-y-2 scale-110" : ""}`}
              >
                <AgentMark templateId={t.templateId} size={54} />
                <span className="assay hidden max-w-[10ch] text-center leading-tight lg:block">
                  {t.name.replace(/^AI /, "")}
                </span>
              </button>
            );
          })}
        </div>

        {/* Readout — whatever you're pointing at, named large. */}
        <div className="mt-12 flex min-h-[5.5rem] flex-col justify-center border-t border-rule pt-7">
          {active ? (
            <div className="flex flex-col gap-1.5">
              <p className="assay text-mint">{active.category}</p>
              <h3 className="font-display text-[clamp(1.5rem,3.4vw,2.4rem)] leading-tight">
                {active.name}
              </h3>
              <p className="max-w-measure text-[0.95rem] text-muted">{active.tagline}</p>
            </div>
          ) : (
            <p className="assay normal-case tracking-[0.06em] text-dim">
              Point at any mark to read it · click to take the tool
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
