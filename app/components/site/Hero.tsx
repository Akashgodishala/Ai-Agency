"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SealCanvas } from "@/components/seal/SealCanvas";
import { MaskedLines } from "@/components/motion/MaskedLines";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";
import { useMagnetic } from "@/components/motion/hooks";
import { motion } from "@/lib/design/tokens";

/**
 * How present the disc is behind the type. High enough that the engraving is
 * unmistakably there, low enough that cream-on-ink body copy still clears
 * contrast where it crosses the rim.
 */
const COIN_OPACITY = 0.5;

/** Rotating placeholders — real jobs, not slogans. */
const PROMPTS = [
  "answer my store's calls and take pickup orders",
  "review my bank statements and flag anything odd",
  "write cold emails for my design studio",
  "handle booking questions for my clinic",
  "read contracts and tell me what to push back on",
];

export function Hero({ agentCount }: { agentCount: number }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [strike, setStrike] = useState(0);
  const [placeholder, setPlaceholder] = useState(PROMPTS[0]);

  const rootRef = useRef<HTMLElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const buttonRef = useMagnetic<HTMLButtonElement>(0.24);

  /** Cycle the placeholder so the box always suggests something concrete. */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % PROMPTS.length;
      setPlaceholder(PROMPTS[i]);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  /**
   * Load choreography. The coin is already engraving itself (SealCanvas owns
   * that), so the type arrives around it rather than competing with it.
   */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      gsap.set(root.querySelectorAll("[data-enter]"), { opacity: 1, y: 0 });
      gsap.set(sealRef.current, { opacity: COIN_OPACITY, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: motion.gsapEase } });

      tl.fromTo(
        sealRef.current,
        { opacity: 0, scale: 0.94 },
        { opacity: COIN_OPACITY, scale: 1, duration: 1.2 },
        0
      )
        .fromTo(
          root.querySelectorAll("[data-enter='kicker']"),
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: motion.duration.settle },
          0.15
        )
        // The headline reveals itself — MaskedLines owns that timeline. The gap
        // is deliberate so the two don't collide.
        .fromTo(
          root.querySelectorAll("[data-enter='body']"),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: motion.duration.settle, stagger: 0.09 },
          1.05
        )
        .fromTo(
          root.querySelectorAll("[data-enter='cue']"),
          { opacity: 0 },
          { opacity: 1, duration: motion.duration.settle },
          1.7
        );
    }, root);

    return () => ctx.revert();
  }, []);

  /**
   * Parallax: the coin leans toward the pointer, as a heavy disc on a table
   * would if you moved a lamp across it. Rotation only — translating it would
   * break the sense that it is seated in the page.
   */
  useEffect(() => {
    const stage = rootRef.current;
    const tilt = tiltRef.current;
    if (!stage || !tilt || prefersReducedMotion()) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const rx = gsap.quickTo(tilt, "rotationX", { duration: 0.9, ease: "power3.out" });
    const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.9, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      rx(-ny * 7);
      ry(nx * 9);
    };
    const onLeave = () => {
      rx(0);
      ry(0);
    };

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(tilt);
    };
  }, []);

  function mint() {
    const value = text.trim();
    if (!value) {
      // Nothing typed: draw attention to the field rather than failing silently.
      fieldRef.current?.classList.add("striking");
      setTimeout(() => fieldRef.current?.classList.remove("striking"), 700);
      (fieldRef.current?.querySelector("input") as HTMLInputElement | null)?.focus();
      return;
    }
    setStrike((n) => n + 1);
    fieldRef.current?.classList.add("striking");
    sessionStorage.setItem("agentmint.pendingDescription", value);
    // Let the strike land before leaving — the moment is the point.
    setTimeout(() => router.push("/create"), 480);
  }

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden"
      aria-labelledby="hero-title"
    >
      <div className="plate-light" aria-hidden="true" />

      {/* ---------------- the coin, struck ----------------
          It sits BEHIND the headline rather than above it. Stacked, the disc
          alone filled the first screen and pushed the sentence — which is the
          actual message — below the fold. Struck currency puts the engraving
          and the lettering on the same face; so does this. */}
      <div
        ref={sealRef}
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 aspect-square w-[min(118vw,40rem)] -translate-x-1/2 -translate-y-[54%] opacity-0 lg:w-[min(64vw,46rem)]"
        style={{ perspective: "1400px" }}
        aria-hidden="true"
      >
        <div
          ref={tiltRef}
          className="h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          <SealCanvas
            text={text || placeholder}
            strikeSignal={strike}
            drawOnMount
            size={760}
            className="h-full w-full"
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-sheet px-6 pb-20 pt-20 lg:pb-28 lg:pt-28">
        <p
          data-enter="kicker"
          className="assay flex flex-wrap items-center gap-3 opacity-0"
        >
          <span className="text-mint">Live</span>
          <span aria-hidden="true">·</span>
          <span>{agentCount} agents ready to strike</span>
          <span aria-hidden="true">·</span>
          <span>or describe your own</span>
        </p>

        {/* ---------------- the headline, at poster scale ---------------- */}
        <MaskedLines
          as="h1"
          id="hero-title"
          className="mt-10 text-hero"
          delay={0.45}
          stagger={0.1}
        >
          Describe the work. Mint the agent.
        </MaskedLines>

        {/* ---------------- the argument and the field ---------------- */}
        <div className="mt-12 grid grid-cols-1 gap-10 lg:mt-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <p
            data-enter="body"
            className="max-w-[42ch] text-lg leading-relaxed text-muted opacity-0"
          >
            Tell AgentMint what you need in plain English. It builds a working AI
            agent you can test right here — before you pay for anything.
          </p>

          <div className="flex flex-col gap-6">
            {/* The describe field. This is real: it mints. */}
            <div data-enter="body" className="opacity-0">
              <div
                ref={fieldRef}
                className="struck flex flex-col gap-3 p-3 transition-colors duration-300 ease-struck focus-within:border-mint sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3 px-2">
                  <span
                    className="assay hidden shrink-0 text-mint sm:block"
                    aria-hidden="true"
                  >
                    I need an agent to
                  </span>
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && mint()}
                    placeholder={placeholder}
                    aria-label="Describe the agent you need"
                    className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-paper outline-none placeholder:text-dim"
                  />
                </div>
                <button
                  ref={buttonRef}
                  type="button"
                  onClick={mint}
                  className="strike-btn assay shrink-0 px-7 py-3"
                >
                  Strike it
                </button>
              </div>
              <p className="assay mt-3 normal-case tracking-normal text-dim">
                <span className="text-muted">Free to test.</span> No card, no
                account, nothing to install.
              </p>
            </div>

            <div
              data-enter="body"
              className="flex flex-wrap items-center gap-5 opacity-0"
            >
              <a
                href="#collection"
                className="group inline-flex items-center gap-2 text-[15px] font-medium text-paper transition-colors hover:text-mint"
              >
                Browse the collection
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 ease-struck group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
              <span className="rule-line hidden h-px w-16 sm:block" aria-hidden="true" />
              <span className="assay normal-case tracking-normal text-dim">
                Every agent carries its own engraved mark
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- scroll cue ---------------- */}
      <div
        data-enter="cue"
        className="relative mx-auto flex max-w-sheet items-center gap-4 px-6 pb-12 opacity-0"
      >
        <span className="rule-line h-px flex-1" aria-hidden="true" />
        <span className="assay cue">Scroll</span>
      </div>
    </section>
  );
}
