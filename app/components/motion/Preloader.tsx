"use client";

import { useEffect, useState } from "react";
import { SealCanvas } from "@/components/seal/SealCanvas";
import { motion } from "@/lib/design/tokens";

const SEEN_KEY = "agentmint.struck";

/**
 * ============================================================================
 * The strike — one die, once per session, then out of the way.
 * ============================================================================
 *
 * Rules this obeys, because a preloader that breaks any of them is a tax on
 * the visitor rather than an introduction:
 *
 *  - It is capped at 1.5s (motion.preloaderMs) and does not wait on the
 *    network. It is choreography, not a loading bar; nothing behind it is
 *    blocked on it finishing.
 *  - It runs once per session. Coming back from /create must not re-play it.
 *  - Under reduced motion it never renders at all — not "faster", not at all.
 *  - It is rendered only after mount, so the server HTML and the first paint
 *    always contain the real page. A crash in here can never hide the site.
 */
export function Preloader() {
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // sessionStorage throws in some privacy modes; a decorative intro is never
    // worth a thrown error, so failing to read it just means "skip".
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      return;
    }

    setShow(true);
    document.body.style.overflow = "hidden";

    const fade = setTimeout(() => setDone(true), motion.preloaderMs);
    const clear = setTimeout(() => {
      setShow(false);
      document.body.style.overflow = "";
    }, motion.preloaderMs + 520);

    return () => {
      clearTimeout(fade);
      clearTimeout(clear);
      document.body.style.overflow = "";
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`preloader ${done ? "is-done" : ""}`} aria-hidden="true">
      <div className="flex flex-col items-center gap-8">
        <SealCanvas
          text="agentmint"
          animate={false}
          drawOnMount
          size={520}
          steps={900}
          className="h-[min(52vw,17rem)] w-[min(52vw,17rem)]"
        />
        <span className="assay text-dim">Striking</span>
      </div>
    </div>
  );
}
