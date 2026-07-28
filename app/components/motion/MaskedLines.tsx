"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap, prefersReducedMotion } from "./gsap";
import { motion } from "@/lib/design/tokens";

/**
 * Line-masked text reveal.
 *
 * Splits rendered text into visual lines (measured after layout, so it follows
 * real wrapping at any width), wraps each in an overflow-hidden mask, and rises
 * them in sequence. Written by hand rather than pulled from a plugin so the
 * markup stays semantic and the behaviour is ours to tune.
 *
 * Reserved for headlines only — animating body copy too animates nothing.
 */
export function MaskedLines({
  children,
  as: Tag = "h2",
  className = "",
  id,
  delay = 0,
  stagger = 0.08,
  play = "load",
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Needed when a section labels itself with aria-labelledby. */
  id?: string;
  delay?: number;
  stagger?: number;
  /** "load" reveals immediately; "scroll" waits until the element is in view. */
  play?: "load" | "scroll";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Keep the original markup so we can restore it on cleanup / re-split.
    const original = el.innerHTML;

    const split = () => {
      el.innerHTML = original;

      // 1. Wrap every word so we can measure where lines break.
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const textNodes: Text[] = [];
      let n: Node | null;
      while ((n = walker.nextNode())) textNodes.push(n as Text);

      textNodes.forEach((node) => {
        const parts = (node.textContent ?? "").split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else if (part.length) {
            const s = document.createElement("span");
            s.className = "ml-word";
            s.style.display = "inline-block";
            s.textContent = part;
            frag.appendChild(s);
          }
        });
        node.parentNode?.replaceChild(frag, node);
      });

      // 2. Group words into lines by their vertical offset.
      const words = Array.from(el.querySelectorAll<HTMLElement>(".ml-word"));
      if (words.length === 0) return [] as HTMLElement[];

      const lines: HTMLElement[][] = [];
      let lastTop: number | null = null;
      words.forEach((w) => {
        const top = w.offsetTop;
        if (lastTop === null || Math.abs(top - lastTop) > 4) {
          lines.push([w]);
          lastTop = top;
        } else {
          lines[lines.length - 1].push(w);
        }
      });

      // 3. Wrap each line in a mask, and the line content in a mover.
      const movers: HTMLElement[] = [];
      lines.forEach((lineWords) => {
        const mask = document.createElement("span");
        mask.className = "ml-mask";
        mask.style.display = "block";
        mask.style.overflow = "hidden";
        // A hair of padding stops descenders (g, y, p) being clipped.
        mask.style.paddingBottom = "0.08em";
        mask.style.marginBottom = "-0.08em";

        const mover = document.createElement("span");
        mover.className = "ml-mover";
        mover.style.display = "block";
        mover.style.willChange = "transform";

        const first = lineWords[0];
        first.parentNode?.insertBefore(mask, first);
        lineWords.forEach((w, i) => {
          if (i > 0) mover.appendChild(document.createTextNode(" "));
          mover.appendChild(w);
        });
        mask.appendChild(mover);
        movers.push(mover);
      });

      return movers;
    };

    const movers = split() ?? [];
    if (movers.length === 0) return;

    if (prefersReducedMotion()) {
      gsap.set(movers, { yPercent: 0, opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(movers, { yPercent: 115, opacity: 0 });
      gsap.to(movers, {
        yPercent: 0,
        opacity: 1,
        duration: motion.duration.long,
        ease: motion.gsapEase,
        stagger,
        delay,
        ...(play === "scroll"
          ? { scrollTrigger: { trigger: el, start: "top 84%", once: true } }
          : {}),
      });
    }, el);

    // Re-split on resize: line breaks move, so the masks must too.
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const next = split() ?? [];
        gsap.set(next, { yPercent: 0, opacity: 1 });
      }, 180);
    };
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
      ctx.revert();
      el.innerHTML = original;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}
