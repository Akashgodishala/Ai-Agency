"use client";

import { useEffect, useRef } from "react";
import { drawSeal } from "@/lib/design/guilloche";

/**
 * The 2D tier of the seal — used on low-power devices, and as the per-agent
 * mark on gallery cards. Same engraving maths as the WebGL disc, rendered on a
 * plain canvas, so this tier looks intentional rather than like a fallback.
 */
export function SealCanvas({
  text,
  strikeSignal = 0,
  animate = true,
  size = 560,
  steps,
  transparent = false,
  className = "",
}: {
  text: string;
  strikeSignal?: number;
  /** Slow rotation. Off for static card marks. */
  animate?: boolean;
  /** Backing-store resolution. */
  size?: number;
  steps?: number;
  /** Drop the struck plate so the engraving sits on the surface behind it. */
  transparent?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const state = useRef({ spin: 0, heat: 0, raf: 0, visible: true });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const s = state.current;

    const paint = () =>
      drawSeal(canvas, { text, spin: s.spin, heat: s.heat, steps, transparent });

    paint();

    if (!animate || reduced) return;

    const loop = () => {
      s.raf = requestAnimationFrame(loop);
      if (!s.visible) return;
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
  }, [text, animate, steps, transparent]);

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
