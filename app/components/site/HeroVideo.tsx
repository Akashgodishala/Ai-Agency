"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The hero film.
 *
 * Autoplays silently on loop as the centrepiece of the page. Muted +
 * playsInline are what allow autoplay to work on iOS and Android at all.
 *
 * Edges are feathered into the background so it reads as part of the page
 * rather than a video pasted into a box, and a dark plate sits underneath so
 * there's never a flash of empty white while it loads.
 */
export function HeroVideo({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    // Anyone who has asked for less motion gets a still frame, not a loop.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.autoplay = false;
      v.pause();
      return;
    }

    // Some browsers reject autoplay until the element is explicitly asked.
    const tryPlay = () => {
      v.play().catch(() => {
        /* Blocked by policy — the still first frame remains, which is fine. */
      });
    };
    if (v.readyState >= 2) tryPlay();
    else v.addEventListener("loadeddata", tryPlay, { once: true });

    // Don't burn battery animating a video nobody can see.
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) tryPlay();
        else v.pause();
      },
      { threshold: 0.1 }
    );
    io.observe(v);

    return () => {
      io.disconnect();
      v.removeEventListener("loadeddata", tryPlay);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Plate underneath: no white flash before the first frame paints. */}
      <div className="absolute inset-0 bg-plate" aria-hidden="true" />

      <video
        ref={ref}
        src="/hero.mp4"
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        aria-hidden="true"
        onError={() => setFailed(true)}
        // Visible from the first paint. Never gate content on an event that
        // might not fire — the dark plate behind already prevents any flash.
        className="hero-film relative h-full w-full object-cover"
      />

      {/* If the file can't be decoded at all, say so quietly rather than
          leaving a black rectangle with no explanation. */}
      {failed && (
        <p className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-muted">
          This browser couldn&apos;t play the intro film.
        </p>
      )}
    </div>
  );
}
