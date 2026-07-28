"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { SealCanvas } from "./SealCanvas";

/**
 * Tier selector for the seal.
 *
 *   1. WebGL   — capable desktop and modern mobile GPUs
 *   2. Canvas  — low-power devices, or when WebGL is unavailable
 *   3. Static  — reduced-motion, or before the capability check resolves
 *
 * All three are the same engraving, so no tier looks like a downgrade. The
 * WebGL bundle is code-split and only fetched once tier 1 is confirmed, which
 * keeps Three.js off the critical path for everyone else.
 */

const SealWebGL = dynamic(() => import("./SealWebGL").then((m) => m.SealWebGL), {
  ssr: false,
});

type Tier = "checking" | "webgl" | "canvas";

function detectTier(): Tier {
  // Coarse pointer + low core count is a good proxy for "phone that will
  // struggle" without user-agent sniffing.
  const cores = navigator.hardwareConcurrency ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (coarse && cores <= 4) return "canvas";

  try {
    const c = document.createElement("canvas");
    const gl =
      c.getContext("webgl2") ??
      c.getContext("webgl") ??
      c.getContext("experimental-webgl");
    return gl ? "webgl" : "canvas";
  } catch {
    return "canvas";
  }
}

export function Seal({
  text,
  strikeSignal,
  className = "",
}: {
  text: string;
  strikeSignal: number;
  className?: string;
}) {
  const [tier, setTier] = useState<Tier>("checking");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTier("canvas");
      return;
    }
    setTier(detectTier());
  }, []);

  if (tier === "webgl") {
    return <SealWebGL text={text} strikeSignal={strikeSignal} className={className} />;
  }

  // Canvas tier, and the pre-hydration state, render the same 2D engraving.
  return (
    <SealCanvas
      text={text}
      strikeSignal={strikeSignal}
      animate={tier === "canvas"}
      className={`h-full w-full ${className}`}
    />
  );
}
