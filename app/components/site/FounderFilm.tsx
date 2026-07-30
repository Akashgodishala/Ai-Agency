"use client";

import { useEffect, useRef, useState } from "react";
import { SealCanvas } from "@/components/seal/SealCanvas";
import { MaskedLines } from "@/components/motion/MaskedLines";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/components/motion/gsap";
import { useReveal } from "@/components/motion/hooks";

/**
 * ============================================================================
 * FROM THE FOUNDER — the film, presented as a plate on the table
 * ============================================================================
 *
 * The film used to open the page on autoplay. It doesn't any more: an
 * unrequested video is the loudest thing a page can do, and the hero's job is
 * the strike. Here it waits to be asked.
 *
 * WHY THERE IS A COVER PLATE AND NOT A POSTER IMAGE: the film's own opening
 * frame is stock-style AI artwork that this direction rules out, so showing it
 * cold would undo the art direction two seconds after the hero establishes it.
 * The cover is an engraved plate — the same seal language as the hero — and
 * lifts on play. The `#t=` fragment on the source means that if the cover is
 * ever bypassed, the frame underneath is drawn from a few seconds into the
 * film rather than from that first frame.
 */
export function FounderFilm() {
  const sectionRef = useReveal<HTMLElement>({ selector: "[data-reveal]", y: 30 });
  const stageRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  /** The plate stands up as it scrolls into view, and leans toward the pointer. */
  useEffect(() => {
    const stage = stageRef.current;
    const tilt = tiltRef.current;
    if (!stage || !tilt || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        tilt,
        { rotationX: 14, y: 40 },
        {
          rotationX: 0,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: stage,
            start: "top 88%",
            end: "top 42%",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        }
      );
    }, stage);

    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return () => ctx.revert();
    }

    const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.8, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      ry(((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 5);
    };
    const onLeave = () => ry(0);

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      ctx.revert();
    };
  }, []);

  /** Pausing off-screen: nobody should hear a film they've scrolled past. */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) v.pause();
      },
      { threshold: 0.15 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  function play() {
    const v = videoRef.current;
    if (!v) return;
    setPlaying(true);
    v.play().catch(() => {
      /* Blocked by policy: controls are visible, so it stays operable. */
    });
    // The cover lifting changes nothing about layout, but the plate's tilt
    // tween measured against the old height — keep ScrollTrigger honest.
    ScrollTrigger.refresh();
  }

  return (
    <section
      ref={sectionRef}
      className="relative bg-ink border-t border-rule py-28 lg:py-40"
      aria-labelledby="founder-title"
    >
      <div className="mx-auto max-w-sheet px-6">
        <div className="flex flex-col gap-5">
          <p data-reveal className="assay opacity-0">
            From the founder
          </p>
          <MaskedLines
            as="h2"
            id="founder-title"
            className="max-w-[16ch] text-display"
            play="scroll"
          >
            Why I built this.
          </MaskedLines>
          <p
            data-reveal
            className="max-w-[52ch] text-lg leading-relaxed text-muted opacity-0"
          >
            Two minutes on what AgentMint is for, and who it's for.
          </p>
        </div>

        <div ref={stageRef} data-reveal className="film-stage mt-14 opacity-0">
          <div ref={tiltRef} className="film-tilt mx-auto max-w-4xl">
            <div className="film-cast" aria-hidden="true" />

            <div className="film-frame">
              <div className="film-plate" aria-hidden="true" />

              <video
                ref={videoRef}
                className="film-media"
                /* #t= asks the browser for a frame a few seconds in, so the
                   still it paints is not the film's first frame. */
                src="/hero.mp4#t=6"
                preload="metadata"
                playsInline
                controls={playing}
                onPlay={() => setPlaying(true)}
                onEnded={() => setPlaying(false)}
              />

              <div className="film-grade" aria-hidden="true" />
              <div className="film-sheen" aria-hidden="true" />
              <div className="film-edge" aria-hidden="true" />

              {/* The engraved cover, and the only way in. */}
              <div
                className={`film-cover ${playing ? "is-lifted" : ""}`}
                aria-hidden={playing}
              >
                <SealCanvas
                  text="from the founder"
                  animate={false}
                  size={420}
                  steps={700}
                  transparent
                  className="absolute inset-0 m-auto h-[86%] w-auto opacity-25"
                />
                <button
                  type="button"
                  onClick={play}
                  className="group relative flex flex-col items-center gap-4"
                  aria-label="Play the founder's film"
                >
                  <span className="flex h-20 w-20 items-center justify-center rounded-full border border-mint/60 bg-mint/10 transition-all duration-500 ease-struck group-hover:border-mint group-hover:bg-mint/20">
                    <span
                      aria-hidden="true"
                      className="ml-1 block h-0 w-0 border-y-[13px] border-l-[21px] border-y-transparent border-l-mint transition-transform duration-500 ease-struck group-hover:scale-110"
                    />
                  </span>
                  <span className="assay text-paper">Play the film</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
