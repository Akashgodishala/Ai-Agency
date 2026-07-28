"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";

/**
 * Single registration point for GSAP and its plugins.
 * Importing from here (never from "gsap" directly in components) guarantees
 * plugins are registered exactly once and only on the client.
 */
let registered = false;

if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger, Flip);
  registered = true;
}

/** True when the visitor has asked for less motion. Checked at call time. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger, Flip };
