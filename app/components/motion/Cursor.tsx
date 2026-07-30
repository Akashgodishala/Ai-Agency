"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "./gsap";

/**
 * ============================================================================
 * The engraver's point — a dot at the pointer, a ring following behind it.
 * ============================================================================
 *
 * Mounted once in the root layout. Renders nothing until it has confirmed a
 * fine pointer AND normal motion, so touch devices and reduced-motion visitors
 * keep their own cursor and cost nothing.
 *
 * WHY THE NATIVE CURSOR IS HIDDEN FROM JS RATHER THAN CSS: hiding it in the
 * stylesheet would apply before hydration and on devices this component
 * declines to run on, leaving people with no pointer at all. The `has-cursor`
 * class is added here only once the replacement is actually on screen.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  /** Decide whether a custom cursor is appropriate at all, and keep watching. */
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => setEnabled(fine.matches && !reduce.matches);
    sync();
    fine.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("has-cursor");

    // The dot is the pointer, so it must be exact. The ring has mass and lags —
    // that difference is the whole effect.
    const dx = gsap.quickTo(dot, "x", { duration: 0.05, ease: "none" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.05, ease: "none" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.42, ease: "power3.out" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.42, ease: "power3.out" });

    let shown = false;
    const onMove = (e: PointerEvent) => {
      if (!shown) {
        // Don't paint the cursor at 0,0 before the pointer has ever moved.
        shown = true;
        gsap.set([dot, ring], { autoAlpha: 1 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);

      // Widen the ring over anything actionable. Resolved per move against the
      // live element under the pointer, so it works for content added later.
      const el = e.target as Element | null;
      const live = !!el?.closest?.(
        'a, button, input, textarea, select, [role="button"], [data-cursor="live"]'
      );
      ring.classList.toggle("is-live", live);
    };

    const onLeave = () => gsap.to([dot, ring], { autoAlpha: 0, duration: 0.2 });
    const onEnter = () => {
      if (shown) gsap.to([dot, ring], { autoAlpha: 1, duration: 0.2 });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      document.documentElement.classList.remove("has-cursor");
      gsap.killTweensOf([dot, ring]);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot invisible opacity-0" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring invisible opacity-0" aria-hidden="true" />
    </>
  );
}
