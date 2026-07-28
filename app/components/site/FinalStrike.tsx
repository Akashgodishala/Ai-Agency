"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { SealCanvas } from "@/components/seal/SealCanvas";
import { MaskedLines } from "@/components/motion/MaskedLines";
import { useMagnetic } from "@/components/motion/hooks";

/**
 * The closing CTA: the strike reprised at full scale.
 *
 * The seal sits behind the words rather than beside them, and the input lives
 * inside the object — so the last thing a visitor does is the same thing the
 * product does. One action, no competing links.
 */
export function FinalStrike() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [strike, setStrike] = useState(0);
  const fieldRef = useRef<HTMLDivElement>(null);
  const buttonRef = useMagnetic<HTMLButtonElement>(0.18);

  function mint() {
    const value = text.trim();
    if (!value) {
      fieldRef.current?.classList.add("striking");
      setTimeout(() => fieldRef.current?.classList.remove("striking"), 700);
      (fieldRef.current?.querySelector("input") as HTMLInputElement | null)?.focus();
      return;
    }
    setStrike((n) => n + 1);
    fieldRef.current?.classList.add("striking");
    sessionStorage.setItem("agentmint.pendingDescription", value);
    setTimeout(() => router.push("/create"), 480);
  }

  return (
    <section
      className="relative overflow-hidden border-t border-rule py-24 lg:py-36"
      aria-labelledby="final-title"
    >
      {/* The seal, enormous and low-contrast, sitting behind the words. */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(120vw,54rem)] -translate-x-1/2 -translate-y-1/2 opacity-[0.14]"
        aria-hidden="true"
      >
        <SealCanvas
          text={text || "describe the work mint the agent"}
          strikeSignal={strike}
          size={620}
          transparent
          className="h-full w-full"
        />
      </div>

      <div className="relative mx-auto flex max-w-sheet flex-col items-center gap-8 px-6 text-center">
        <p className="assay">Your turn</p>

        <MaskedLines
          as="h2"
          id="final-title"
          className="max-w-[15ch] font-display text-[clamp(2.4rem,6.5vw,5.2rem)] leading-[1.02]"
          play="scroll"
        >
          One sentence. One agent. Free to find out.
        </MaskedLines>

        <p className="max-w-[44ch] text-lg text-muted">
          Describe the job you'd hand to someone if you could. You'll be talking
          to the agent that does it in about a minute.
        </p>

        <div className="w-full max-w-2xl">
          <div
            ref={fieldRef}
            className="struck flex flex-col gap-3 p-3 transition-colors duration-300 ease-struck focus-within:border-mint-deep sm:flex-row sm:items-center"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && mint()}
              placeholder="answer my store's calls and take pickup orders"
              aria-label="Describe the agent you need"
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[15px] text-paper outline-none placeholder:text-dim"
            />
            <button
              ref={buttonRef}
              type="button"
              onClick={mint}
              className="assay shrink-0 border border-brass bg-transparent px-7 py-3 text-brass transition-colors duration-200 ease-struck hover:bg-brass hover:text-ink"
            >
              Strike it
            </button>
          </div>
          <p className="assay mt-3 normal-case tracking-normal text-dim">
            No card. No account. Nothing to install.
          </p>
        </div>
      </div>
    </section>
  );
}
