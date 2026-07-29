"use client";

import { useEffect, useRef } from "react";
import { TEMPLATES } from "@/lib/templates";
import { markFor, CARTOUCHE } from "@/lib/design/marks";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";

/**
 * The wall of workers.
 *
 * Every agent in the catalogue, engraved at once, drifting in depth behind the
 * hero. Marks light up and dim in a slow wandering rhythm so the wall feels
 * alive rather than printed — as if the tools were breathing in their racks.
 *
 * Cheap by construction: fifty small inline SVGs, no images, no WebGL, and a
 * single interval driving the whole thing.
 */
export function MarkWall({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cells = Array.from(root.querySelectorAll<HTMLElement>("[data-cell]"));
    if (cells.length === 0) return;

    if (prefersReducedMotion()) {
      gsap.set(cells, { opacity: 0.22 });
      return;
    }

    const ctx = gsap.context(() => {
      // Arrival: the wall engraves itself outward from the middle.
      gsap.fromTo(
        cells,
        { opacity: 0, scale: 0.72 },
        {
          opacity: 0.16,
          scale: 1,
          duration: 1.1,
          ease: "power3.out",
          stagger: { each: 0.012, from: "center", grid: "auto" },
          delay: 0.25,
        }
      );

      // A slow wander: a handful of marks glow, then fade back.
      const pulse = () => {
        const picks = gsap.utils.shuffle([...cells]).slice(0, 5);
        picks.forEach((cell, i) => {
          gsap
            .timeline({ delay: i * 0.26 })
            .to(cell, { opacity: 0.85, scale: 1.16, duration: 0.9, ease: "power2.out" })
            .to(cell, { opacity: 0.16, scale: 1, duration: 1.7, ease: "power2.inOut" }, ">-0.35");
        });
      };
      pulse();
      const id = window.setInterval(pulse, 2600);
      return () => window.clearInterval(id);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <div className="grid grid-cols-6 gap-x-5 gap-y-5 sm:grid-cols-8 lg:grid-cols-6 xl:grid-cols-7">
        {TEMPLATES.map((t) => {
          const m = markFor(t.templateId);
          return (
            <div key={t.templateId} data-cell className="opacity-0">
              <svg viewBox="0 0 24 24" className="h-full w-full">
                <path
                  d={CARTOUCHE[m.world]}
                  fill="none"
                  stroke="rgb(var(--mint))"
                  strokeWidth="0.9"
                  opacity="0.55"
                />
                {m.g.map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    fill="none"
                    stroke="rgb(var(--ink))"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
                {m.dots?.map(([cx, cy, r], i) => (
                  <circle key={i} cx={cx} cy={cy} r={r} fill="rgb(var(--ink))" />
                ))}
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}
