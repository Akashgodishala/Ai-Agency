"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";

/**
 * The hero film — presented as a physical object resting on the page.
 *
 * Three things stop this reading as "a video pasted into a rectangle":
 *
 *  1. PERSPECTIVE. The plate lives inside a 3D stage and is tilted away from
 *     the viewer, so it occupies space rather than sitting flat on the surface.
 *  2. A CAST SHADOW. It is dropped onto the paper below and behind the plate,
 *     which is what actually convinces the eye something is lifted off a white
 *     ground. Glow can't do this on light backgrounds; shadow can.
 *  3. SCROLL AND POINTER COUPLING. It stands up as you scroll it into view and
 *     leans toward the cursor, so it responds to the page instead of ignoring it.
 *
 * Autoplay needs muted + playsInline or iOS and Android refuse outright.
 */
export function HeroVideo({ className = "" }: { className?: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  /** Playback: autoplay, pause off-screen, still frame under reduced motion. */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (prefersReducedMotion()) {
      v.autoplay = false;
      v.pause();
      return;
    }

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

  /** The 3D behaviour: scroll stands the plate up, the pointer leans it. */
  useEffect(() => {
    const stage = stageRef.current;
    const tilt = tiltRef.current;
    if (!stage || !tilt) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Standing up: starts leaning back and rises as the hero settles.
      gsap.fromTo(
        tilt,
        { rotateX: 17, rotateY: -9, scale: 0.94, y: 26 },
        {
          rotateX: 7,
          rotateY: -3.5,
          scale: 1,
          y: 0,
          duration: 1.9,
          ease: "power3.out",
          delay: 0.2,
        }
      );

      // Scroll continues the rotation, so the plate keeps turning as the page
      // moves rather than freezing into a static image.
      gsap.to(tilt, {
        rotateX: -6,
        y: -46,
        ease: "none",
        scrollTrigger: {
          trigger: stage,
          start: "top 12%",
          end: "bottom top",
          scrub: 0.8,
        },
      });

      // Pointer lean. quickTo keeps this cheap on every mousemove.
      const rx = gsap.quickTo(tilt, "rotateX", { duration: 0.7, ease: "power3.out" });
      const ry = gsap.quickTo(tilt, "rotateY", { duration: 0.7, ease: "power3.out" });

      let base = 7;
      const onMove = (e: PointerEvent) => {
        const r = stage.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rx(base - py * 13);
        ry(px * 17);
      };
      const onLeave = () => {
        rx(base);
        ry(-3.5);
      };

      // While scrolling, the scrub owns rotateX — read it back so the pointer
      // leans around wherever the scroll has put it instead of snapping.
      const onScroll = () => {
        base = Number(gsap.getProperty(tilt, "rotateX")) || 0;
      };

      stage.addEventListener("pointermove", onMove);
      stage.addEventListener("pointerleave", onLeave);
      window.addEventListener("scroll", onScroll, { passive: true });

      return () => {
        stage.removeEventListener("pointermove", onMove);
        stage.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("scroll", onScroll);
      };
    }, stage);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={stageRef} className={`film-stage ${className}`}>
      <div ref={tiltRef} className="film-tilt">
        {/* Cast shadow: the thing that actually sells "lifted" on white paper. */}
        <div className="film-cast" aria-hidden="true" />

        <div className="film-frame">
          {/* Warm plate underneath — no flash of empty white before first paint. */}
          <div className="film-plate" aria-hidden="true" />

          <video
            ref={videoRef}
            src="/hero.mp4"
            // The first frame, served as a still. It paints immediately while
            // six megabytes of video are still arriving, and it is what remains
            // on any browser that cannot decode the file at all — so this frame
            // never goes blank.
            poster="/hero-poster.jpg"
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            aria-hidden="true"
            onError={() => setFailed(true)}
            // Visible from the first paint. Never gate content on an event that
            // might not fire — the plate behind already prevents any flash.
            className="film-media"
          />

          {/* Grade + sheen tie the footage to the brand and give the surface
              something to catch the light on as it turns. */}
          <div className="film-grade" aria-hidden="true" />
          <div className="film-sheen" aria-hidden="true" />
          <div className="film-edge" aria-hidden="true" />

          {/* No error card here: when decoding fails the poster frame is still
              on screen, so the composition holds. Announcing the failure over
              a perfectly good still would be worse than saying nothing. */}
          {failed && <span className="sr-only">Intro film unavailable; showing a still frame.</span>}
        </div>
      </div>
    </div>
  );
}
