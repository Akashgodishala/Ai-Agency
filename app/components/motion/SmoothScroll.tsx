"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "./gsap";

/**
 * ============================================================================
 * Smooth scrolling — the one place the page's scroll is driven from.
 * ============================================================================
 *
 * Mounted once in the root layout. Renders nothing; it exists to own the Lenis
 * instance and keep it in step with ScrollTrigger.
 *
 * WHY LENIS AND SCROLLTRIGGER MUST BE WIRED TOGETHER: Lenis stops the browser
 * scrolling natively and animates a transform instead. ScrollTrigger listens for
 * native scroll events, so left alone it would never hear about the movement and
 * every scroll-linked animation on the site would freeze. The three lines below
 * are the integration Lenis documents for GSAP:
 *
 *   lenis.on('scroll', ScrollTrigger.update)          — tell ScrollTrigger
 *   gsap.ticker.add((t) => lenis.raf(t * 1000))       — one clock, not two
 *   gsap.ticker.lagSmoothing(0)                       — never skip frames
 *
 * The single clock matters: running Lenis on its own requestAnimationFrame and
 * GSAP on another means the two read slightly different times each frame, which
 * shows up as pinned sections juddering. `autoRaf` defaults to false, so Lenis
 * is only ever advanced by the GSAP ticker. `lagSmoothing(0)` is required
 * because GSAP's lag smoothing normally fakes the elapsed time after a stall,
 * which would hand Lenis a time that disagrees with the real one.
 */
export function SmoothScroll() {
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    const start = () => {
      if (lenis) return;

      lenis = new Lenis({
        // Let Lenis animate #anchor links, since native `scroll-behavior:
        // smooth` cannot see a scroll it isn't driving.
        anchors: true,
        // The playground's chat transcript is its own scrolling box. Without
        // this, a wheel over the transcript would move the page instead.
        allowNestedScroll: true,
      });

      lenis.on("scroll", ScrollTrigger.update);

      tick = (time: number) => {
        // GSAP's ticker reports seconds; Lenis expects milliseconds.
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // Every trigger created before Lenis existed measured against the native
      // scroller. Re-measure now that Lenis owns the scroll.
      ScrollTrigger.refresh();
    };

    const stop = () => {
      if (!lenis) return;
      if (tick) gsap.ticker.remove(tick);
      // Hand GSAP back its documented defaults — this component switched them,
      // so this component restores them.
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenis = null;
      tick = null;
      // Positions were measured against Lenis's transform; remeasure now that
      // the browser is scrolling natively again.
      ScrollTrigger.refresh();
    };

    /**
     * Reduced motion means no Lenis at all, not a faster Lenis. Smooth scrolling
     * is itself the animation someone is asking us not to run, and the honest
     * answer is to hand scrolling back to the browser untouched.
     *
     * Read at mount AND on change, because the preference can be toggled while
     * the page is open.
     */
    const sync = () => (query.matches ? stop() : start());

    sync();
    query.addEventListener("change", sync);

    /**
     * RE-MEASURE ONCE THE PAGE HAS STOPPED CHANGING SHAPE.
     *
     * Triggers are created during hydration, while the display serif is still
     * loading. Bodoni Moda is far taller per line than the fallback, so a
     * headline set at poster scale can gain hundreds of pixels the moment the
     * real font swaps in — and every start/end computed before that is wrong by
     * exactly that much. `document.fonts.ready` is the honest signal for it;
     * `load` covers late images and anything else that shifts the page.
     */
    let disposed = false;
    const remeasure = () => {
      if (!disposed) ScrollTrigger.refresh();
    };
    document.fonts?.ready.then(remeasure);
    if (document.readyState === "complete") remeasure();
    else window.addEventListener("load", remeasure, { once: true });

    return () => {
      disposed = true;
      window.removeEventListener("load", remeasure);
      query.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return null;
}
