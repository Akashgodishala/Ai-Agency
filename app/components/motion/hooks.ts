"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap";
import { motion } from "@/lib/design/tokens";

/**
 * ============================================================================
 * MOTION HOOKS
 * ============================================================================
 * Motion is declarative at the component level; every timeline is created
 * inside a gsap.context so React strict-mode double-invocation and route
 * changes clean up automatically. No animation logic lives in JSX.
 *
 * Every hook honours prefers-reduced-motion by jumping to the end state, so
 * the page stays complete and composed rather than half-animated.
 */

/** Reveal children on scroll: staggered rise with the house easing. */
export function useReveal<T extends HTMLElement>(
  options: { selector?: string; stagger?: number; y?: number; start?: string } = {}
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = options.selector
      ? Array.from(el.querySelectorAll<HTMLElement>(options.selector))
      : (Array.from(el.children) as HTMLElement[]);
    if (targets.length === 0) return;

    if (prefersReducedMotion()) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y: options.y ?? 26 },
        {
          opacity: 1,
          y: 0,
          duration: motion.duration.settle,
          ease: motion.gsapEase,
          stagger: options.stagger ?? motion.stagger,
          scrollTrigger: {
            trigger: el,
            start: options.start ?? "top 82%",
            once: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [options.selector, options.stagger, options.y, options.start]);

  return ref;
}

/**
 * Magnetic pointer attraction — the element leans toward the cursor.
 * Deliberately subtle: struck metal has mass, so the pull is small and slow.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.22): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    // Pointer attraction is meaningless on touch — skip the listeners entirely.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(el);
    };
  }, [strength]);

  return ref;
}

/**
 * NOTE ON PINNING — read before adding another pinned section.
 *
 * ScrollTrigger's `pin` re-parents the pinned element into a generated
 * `.pin-spacer` div. React does not know this happened and still believes the
 * node it rendered is a direct child of its original parent, so on navigation
 * it calls removeChild against the wrong parent and takes down the whole page
 * with "NotFoundError: The node to be removed is not a child of this node".
 *
 * Always pin an element *nested inside* the component's outermost node — never
 * the outermost node itself. Then the spacer lives inside a wrapper React never
 * moves, and React only ever removes that wrapper. See Worlds.tsx.
 */

/** Refresh ScrollTrigger after async content changes the page height. */
export function refreshScroll(): void {
  ScrollTrigger.refresh();
}
