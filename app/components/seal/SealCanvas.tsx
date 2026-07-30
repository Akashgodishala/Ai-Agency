"use client";

import { useEffect, useRef } from "react";
import { drawSeal } from "@/lib/design/guilloche";

/**
 * The engraved disc, rendered on a plain 2D canvas.
 *
 * Used two ways: as the hero centrepiece at full size, and as the small mark on
 * gallery cards. Same engraving maths either way, so a card's mark and the hero
 * coin are visibly the same object at different scales.
 */
export function SealCanvas({
  text,
  strikeSignal = 0,
  animate = true,
  drawOnMount = false,
  size = 560,
  steps,
  transparent = false,
  className = "",
}: {
  text: string;
  strikeSignal?: number;
  /** Slow rotation. Off for static card marks. */
  animate?: boolean;
  /**
   * Engrave the disc into being on first paint — the strike moment. Off by
   * default so fifty card marks don't all perform on load.
   */
  drawOnMount?: boolean;
  /** Backing-store resolution. */
  size?: number;
  steps?: number;
  /** Drop the struck plate so the engraving sits on the surface behind it. */
  transparent?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const state = useRef({ spin: 0, heat: 0, raf: 0, visible: true, reveal: 1 });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const s = state.current;

    // Reduced motion gets the finished coin immediately: the strike is an
    // animation, and the disc is the content. Never trade one for the other.
    s.reveal = drawOnMount && !reduced ? 0 : 1;

    const paint = () =>
      drawSeal(canvas, {
        text,
        spin: s.spin,
        heat: s.heat,
        reveal: s.reveal,
        steps,
        transparent,
      });

    paint();

    if (reduced) return;
    if (!animate && !drawOnMount) return;

    /** The strike: fast at the start, settling as the die seats. */
    const STRIKE_MS = 1250;
    let started = 0;

    const loop = (now: number) => {
      s.raf = requestAnimationFrame(loop);
      if (!s.visible) return;

      if (s.reveal < 1) {
        if (!started) started = now;
        const t = Math.min(1, (now - started) / STRIKE_MS);
        // easeOutCubic — struck metal never overshoots.
        s.reveal = 1 - Math.pow(1 - t, 3);
        // The disc holds still while it is being cut; spin starts after.
        paint();
        return;
      }

      if (!animate) {
        // Nothing left to animate once the strike has landed.
        cancelAnimationFrame(s.raf);
        s.raf = 0;
        return;
      }
      s.spin += 0.0016;
      if (s.heat > 0) s.heat = Math.max(0, s.heat - 0.018);
      paint();
    };

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (s.visible = e.isIntersecting)),
      { threshold: 0 }
    );
    io.observe(canvas);
    s.raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      io.disconnect();
    };
  }, [text, animate, drawOnMount, steps, transparent]);

  useEffect(() => {
    if (strikeSignal > 0) state.current.heat = 1;
  }, [strikeSignal]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    />
  );
}
