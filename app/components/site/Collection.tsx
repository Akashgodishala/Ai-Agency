"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { TEMPLATES, instantiateTemplate, type AgentTemplate } from "@/lib/templates";
import { saveAgent, listAgents } from "@/lib/store";
import { AgentMark } from "@/components/seal/AgentMark";
import { MaskedLines } from "@/components/motion/MaskedLines";
import { useReveal } from "@/components/motion/hooks";
import { gsap, Flip, prefersReducedMotion } from "@/components/motion/gsap";

/** Plain-language shortcuts, phrased the way visitors actually think. */
const SHORTCUTS = [
  { label: "Front desk", q: "receptionist" },
  { label: "Customer support", q: "support" },
  { label: "Invoices & billing", q: "invoice" },
  { label: "Fraud & fees", q: "fraud" },
  { label: "Outreach", q: "cold email" },
  { label: "Property", q: "listing" },
];

export function Collection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [storageError, setStorageError] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const headRef = useReveal<HTMLDivElement>({ selector: "[data-r]" });

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(TEMPLATES.map((t) => t.category)))],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TEMPLATES.filter((t) => {
      if (category !== "All" && t.category !== category) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.audience.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q))
      );
    });
  }, [query, category]);

  /**
   * Filter with FLIP: cards fly to their new positions instead of the grid
   * blinking. Captured before state changes, played after React commits.
   */
  function transition(change: () => void) {
    const grid = gridRef.current;
    if (!grid || prefersReducedMotion()) {
      change();
      return;
    }
    const state = Flip.getState(grid.querySelectorAll("[data-card]"));
    change();
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.55,
        ease: "power3.out",
        stagger: 0.012,
        absolute: true,
        onEnter: (els) =>
          gsap.fromTo(els, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.42 }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.94, duration: 0.28 }),
      });
    });
  }

  function grab(t: AgentTemplate) {
    const existing = listAgents().find((a) => a.createdFrom === t.templateId);
    if (existing) {
      router.push(`/playground/${existing.id}`);
      return;
    }
    const config = instantiateTemplate(t);
    if (!saveAgent(config)) {
      setStorageError(true);
      return;
    }
    router.push(`/playground/${config.id}`);
  }

  return (
    <section id="collection" className="scroll-mt-20 border-t border-rule py-20 lg:py-28">
      <div className="mx-auto max-w-sheet px-6">
        <div ref={headRef} className="flex flex-col gap-4">
          <p data-r className="assay opacity-0">
            The collection · {TEMPLATES.length} struck and ready
          </p>
          <MaskedLines as="h2" className="text-title max-w-[18ch]" play="scroll">
            Take one off the shelf. Make it yours.
          </MaskedLines>
          <p data-r className="max-w-measure text-muted opacity-0">
            Every agent arrives working, with its own engraved mark. Teach it your
            information, change how it speaks, and it becomes yours — no two are
            alike once you've worked on them.
          </p>
        </div>

        {/* shortcuts */}
        <div className="mt-9 flex flex-wrap gap-2">
          {SHORTCUTS.map((s) => (
            <button
              key={s.q}
              type="button"
              onClick={() => transition(() => { setCategory("All"); setQuery(s.q); })}
              className="assay border border-rule bg-plate px-4 py-2 normal-case tracking-[0.08em] text-muted transition-colors duration-200 ease-struck hover:border-mint-deep hover:text-paper"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* search + categories */}
        {/* z stays below the pinned Worlds section, which scrolls over this. */}
        <div className="sticky top-[57px] z-20 -mx-6 mt-6 border-y border-rule bg-ink/92 px-6 py-3 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={query}
              onChange={(e) => transition(() => setQuery(e.target.value))}
              placeholder={`Search ${TEMPLATES.length} agents`}
              aria-label="Search agents"
              className="w-full border border-rule bg-plate px-4 py-2.5 text-sm text-paper outline-none transition-colors duration-200 ease-struck placeholder:text-dim focus:border-mint-deep sm:max-w-xs"
            />
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => {
                const active = category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => transition(() => setCategory(c))}
                    aria-pressed={active}
                    className={`assay px-3.5 py-2 normal-case tracking-[0.08em] transition-colors duration-200 ease-struck ${
                      active
                        ? "bg-mint text-ink"
                        : "border border-rule text-muted hover:border-mint-deep hover:text-paper"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {storageError && (
          <p className="mt-5 border border-danger/50 bg-danger/10 px-4 py-3 text-sm text-danger">
            This browser's storage is full, so the agent couldn't be saved. Delete
            one you no longer need in “My agents”, then try again.
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="mt-10 border border-dashed border-rule p-12 text-center">
            <p className="text-muted">
              Nothing on the shelf matches “{query}”.
            </p>
            <a
              href="#top"
              className="assay mt-5 inline-block border border-mint px-6 py-3 normal-case tracking-[0.08em] text-mint transition-colors duration-200 ease-struck hover:bg-mint hover:text-ink"
            >
              Describe it instead — we'll strike it custom
            </a>
          </div>
        ) : (
          <div
            ref={gridRef}
            className="mt-8 grid grid-cols-1 gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((t) => (
              <AgentPlate key={t.templateId} template={t} onGrab={() => grab(t)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** One agent, presented as a struck plate with its own engraving. */
function AgentPlate({
  template: t,
  onGrab,
}: {
  template: AgentTemplate;
  onGrab: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  /** Cursor-tracked rim light: the plate catches light where you point. */
  function onMove(e: React.PointerEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  }

  return (
    <button
      ref={ref}
      data-card
      type="button"
      onPointerMove={onMove}
      onClick={onGrab}
      className="group relative flex flex-col gap-4 bg-plate p-6 text-left transition-colors duration-300 ease-struck hover:bg-plate2"
      style={
        {
          backgroundImage:
            "radial-gradient(340px circle at var(--mx,50%) var(--my,0%), rgb(var(--mint)/0.07), transparent 60%)",
        } as React.CSSProperties
      }
    >
      <div className="flex items-start justify-between gap-3">
        <AgentMark templateId={t.templateId} size={58} />
        <span className="assay border border-rule px-2.5 py-1 normal-case tracking-[0.08em]">
          {t.audience}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-display text-[1.35rem] leading-tight">{t.name}</h3>
        <p className="line-clamp-2 text-[0.92rem] leading-relaxed text-muted">{t.tagline}</p>
      </div>

      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="assay">{t.category}</span>
        <span className="assay flex items-center gap-1.5 normal-case tracking-[0.08em] text-mint">
          Take it
          <span
            aria-hidden="true"
            className="transition-transform duration-200 ease-struck group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </div>
    </button>
  );
}
