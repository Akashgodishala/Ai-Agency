"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { TEMPLATES, instantiateTemplate, type AgentTemplate } from "@/lib/templates";
import { saveAgent, listAgents } from "@/lib/store";

const EXAMPLES = [
  "An agent for my bakery that answers questions and takes custom-cake requests",
  "Review my bank statements and flag anything suspicious",
  "Write cold emails for my design studio",
  "Plan my two weeks in Japan",
];

export default function Landing() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [storageError, setStorageError] = useState(false);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(TEMPLATES.map((t) => t.category)))],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TEMPLATES.filter((t) => {
      if (activeCategory !== "All" && t.category !== activeCategory) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.audience.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q))
      );
    });
  }, [query, activeCategory]);

  function startCreate(desc: string) {
    const d = desc.trim();
    if (!d) return;
    sessionStorage.setItem("agentmint.pendingDescription", d);
    router.push("/create");
  }

  function grabTemplate(t: AgentTemplate) {
    // If an agent from this template already exists, open it instead of
    // silently minting duplicates while browsing.
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
    <div>
      {/* ================= HERO ================= */}
      <section id="create" className="relative overflow-hidden">
        <div className="hero-aurora" aria-hidden />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-14 pt-16 text-center sm:pt-24">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-mint">
            {TEMPLATES.length} ready-made agents · or describe your own · no coding
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] sm:text-6xl">
            Describe it. <span className="text-mint">Mint it.</span>
            <br className="hidden sm:block" /> Test it. Make it yours.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
            Your own AI agent for any use case — money, home, work, marketing, life. Try it right
            here on this page before you commit to anything.
          </p>

          <form
            className="mx-auto mt-10 max-w-2xl"
            onSubmit={(e) => {
              e.preventDefault();
              startCreate(description);
            }}
          >
            <div className="magic-ring shadow-card">
              <div className="rounded-[18.5px] bg-surface p-3">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      startCreate(description);
                    }
                  }}
                  rows={3}
                  placeholder="What should your agent do? e.g. “Track my freelance expenses and warn me about weird charges”"
                  className="w-full resize-none bg-transparent px-2 py-1.5 text-base outline-none placeholder:text-muted/70"
                  aria-label="Describe your agent"
                />
                <div className="flex items-center justify-between gap-3 px-2 pb-1">
                  <span className="hidden text-xs text-muted sm:inline">
                    Enter to start · Shift+Enter for a new line
                  </span>
                  <button
                    type="submit"
                    disabled={!description.trim()}
                    className="ml-auto rounded-full bg-mint px-6 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-mint-deep disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Mint my agent →
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setDescription(ex)}
                className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs text-muted transition hover:border-mint hover:text-ink"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Agent-name marquee — the catalog itself is the spectacle */}
        <div className="marquee-mask relative border-y border-line bg-surface/60 py-3">
          <div className="marquee" aria-hidden>
            {[...TEMPLATES, ...TEMPLATES].map((t, i) => (
              <span
                key={`${t.templateId}-${i}`}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted"
              >
                <span>{t.emoji}</span> {t.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-5">
        {/* ================= HOW IT WORKS ================= */}
        <section className="grid gap-8 py-14 sm:grid-cols-3">
          {[
            ["1", "Describe or grab", "Say what you need in your own words — or pick one of the ready-made agents below and make it yours."],
            ["2", "Test it right here", "Chat with your agent on this site as long as you like. Teach it your info, tune its personality in plain English."],
            ["3", "Keep it when it's right", "Free while we're in early access. Paid plans arrive with publishing — a share link and website widget for your agent."],
          ].map(([n, title, body]) => (
            <div key={n}>
              <div className="font-mono text-xs font-bold tracking-widest text-mint">STEP {n}</div>
              <h3 className="mt-2 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted">{body}</p>
            </div>
          ))}
        </section>

        {/* ================= GALLERY ================= */}
        <section id="gallery" className="pb-20">
          <div className="mb-6 flex flex-col gap-2">
            <h2 className="text-2xl font-semibold sm:text-3xl">The agent gallery</h2>
            <p className="text-muted">
              {TEMPLATES.length} agents, ready in one click. Every one is yours to retrain, rename,
              and teach your own info.
            </p>
          </div>

          {/* Search + category filters */}
          <div className="sticky top-16 z-30 -mx-5 mb-8 border-b border-line bg-ground/90 px-5 py-3 backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${TEMPLATES.length} agents…`}
                className="w-full rounded-full border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-mint sm:max-w-xs"
                aria-label="Search agents"
              />
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      activeCategory === c
                        ? "bg-mint text-white"
                        : "border border-line bg-surface text-muted hover:border-mint hover:text-ink"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {storageError && (
            <p className="mb-4 rounded-card border border-red-300 bg-red-500/10 px-4 py-3 text-sm text-red-500">
              Your browser's storage is full, so the agent couldn't be saved. Delete an agent you no
              longer need in “My agents”, then try again.
            </p>
          )}

          {filtered.length === 0 ? (
            <p className="rounded-card border border-dashed border-line p-10 text-center text-muted">
              No agents match “{query}” — but that's what the box above is for. Describe it and
              we'll mint it custom.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t) => (
                <button
                  key={t.templateId}
                  onClick={() => grabTemplate(t)}
                  className="card-glow group rounded-card border border-line bg-surface p-5 text-left shadow-card hover:border-mint"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-mint-soft text-xl">
                      {t.emoji}
                    </span>
                    <span className="rounded-full border border-line px-2.5 py-1 text-[11px] text-muted">
                      {t.audience}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">{t.name}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted">{t.tagline}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-muted/70">
                      {t.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-mint">
                      Add to my agents
                      <span className="transition group-hover:translate-x-0.5">→</span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
