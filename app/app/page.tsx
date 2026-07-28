"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { TEMPLATES, instantiateTemplate, type AgentTemplate } from "@/lib/templates";
import { saveAgent, listAgents, saveInterest } from "@/lib/store";
import { Reveal, CountUp, ScrollProgress } from "@/components/motion";

const EXAMPLES = [
  "An agent for my bakery that answers questions and takes custom-cake requests",
  "Review my bank statements and flag anything suspicious",
  "Write cold emails for my design studio",
  "A receptionist for my liquor store that takes pickup orders",
];

/** One-tap shortcuts for the ways non-technical visitors actually think. */
const CAPABILITY_CHIPS: { label: string; query: string }[] = [
  { label: "🛎️ Receptionist", query: "receptionist" },
  { label: "🎧 Call & customer support", query: "call support" },
  { label: "🧾 Invoice review", query: "invoice" },
  { label: "🕵️ Fraud & fee checks", query: "fraud" },
  { label: "✉️ Cold outreach", query: "cold email" },
  { label: "🏠 Home & property", query: "listing" },
];

/** Capabilities we're building next — visible, honest, waitlisted. */
const COMING_SOON = [
  {
    id: "waitlist-voice",
    emoji: "📞",
    name: "Voice & Phone agents",
    desc: "Your agent answers your real business line — takes orders, answers questions, and hands hard calls to you.",
  },
  {
    id: "waitlist-sms",
    emoji: "💬",
    name: "Texts & payment links",
    desc: "Order-ready notifications and pay-by-link texts sent to your customers automatically.",
  },
  {
    id: "waitlist-connect",
    emoji: "🔌",
    name: "App connections",
    desc: "Your agent's activity flowing into the tools you already use — calendars, sheets, your store's app.",
  },
];

export default function Landing() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [storageError, setStorageError] = useState(false);
  const [waitlist, setWaitlist] = useState<{ id: string; email: string; done: boolean } | null>(null);
  const galleryRef = useRef<HTMLElement>(null);

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

  function pickCapability(q: string) {
    setActiveCategory("All");
    setQuery(q);
    galleryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function joinWaitlist(id: string, name: string, email: string) {
    if (!email.trim()) return;
    saveInterest({ agentId: id, agentName: name, email: email.trim(), at: new Date().toISOString() });
    setWaitlist({ id, email: "", done: true });
  }

  return (
    <div>
      <ScrollProgress />

      {/* ================= HERO ================= */}
      <section id="create" className="relative overflow-hidden">
        <div className="hero-aurora" aria-hidden />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-14 pt-16 text-center sm:pt-24">
          <p className="hero-enter font-mono text-xs uppercase tracking-[0.2em] text-mint" style={{ animationDelay: "0ms" }}>
            {TEMPLATES.length} ready-made agents · or describe your own · no tech skills needed
          </p>
          <h1 className="hero-enter mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] sm:text-6xl" style={{ animationDelay: "120ms" }}>
            Describe it. <span className="text-mint">Mint it.</span>
            <br className="hidden sm:block" /> Test it. Make it yours.
          </h1>
          <p className="hero-enter mx-auto mt-6 max-w-xl text-lg text-muted" style={{ animationDelay: "240ms" }}>
            Your own AI agent for any use case — money, home, work, marketing, life. Try it right
            here on this page before you pay a thing.
          </p>

          <form
            className="hero-enter mx-auto mt-10 max-w-2xl"
            style={{ animationDelay: "360ms" }}
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
                  placeholder="What should your agent do? e.g. “Answer my store's calls about hours and take pickup orders”"
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

          <div className="hero-enter mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-2" style={{ animationDelay: "480ms" }}>
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
        {/* ================= STATS ================= */}
        <section className="grid grid-cols-2 gap-6 border-b border-line py-12 text-center sm:grid-cols-4">
          {[
            [<CountUp key="a" to={TEMPLATES.length} />, "agents ready today"],
            [<CountUp key="b" to={6} />, "categories, growing"],
            [<span key="c">~<CountUp to={2} /> min</span>, "to mint your own"],
            [<span key="d">$<CountUp to={0} /></span>, "to test-drive any agent"],
          ].map(([num, label], i) => (
            <Reveal key={i} delay={i * 90}>
              <div className="font-display text-4xl font-semibold text-mint" style={{ fontVariantNumeric: "tabular-nums" }}>
                {num}
              </div>
              <div className="mt-1.5 text-sm text-muted">{label}</div>
            </Reveal>
          ))}
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="grid gap-8 py-14 sm:grid-cols-3">
          {[
            ["1", "Describe or grab", "Say what you need in your own words — or pick a ready-made agent below and make it yours."],
            ["2", "Test it right here", "Chat with your agent on this site as long as you like. Teach it your info, tune its personality in plain English."],
            ["3", "Keep it when it's right", "Free while we're in early access. Monthly and yearly plans arrive with publishing — a share link and website widget for your agent."],
          ].map(([n, title, body], i) => (
            <Reveal key={n} delay={i * 120}>
              <div className="font-mono text-xs font-bold tracking-widest text-mint">STEP {n}</div>
              <h3 className="mt-2 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted">{body}</p>
            </Reveal>
          ))}
        </section>

        {/* ================= STATEMENT ================= */}
        <Reveal as="section" className="border-y border-line py-16 text-center sm:py-24">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">The whole idea</p>
          <p className="statement-gradient mx-auto mt-4 max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-5xl">
            You run the business. Your agent runs the busywork.
          </p>
          <p className="mx-auto mt-5 max-w-xl text-muted">
            No dashboards to learn, nothing to install. You talk to it like a person, it works like
            a pro — and you only ever see the results.
          </p>
        </Reveal>

        {/* ================= GALLERY ================= */}
        <section ref={galleryRef} id="gallery" className="scroll-mt-24 py-16">
          <Reveal>
            <div className="mb-2 flex flex-col gap-2">
              <h2 className="text-2xl font-semibold sm:text-3xl">The agent gallery</h2>
              <p className="text-muted">
                {TEMPLATES.length} agents, ready in one click — and this shelf keeps growing. Every
                one is yours to retrain, rename, and teach your own info.
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {CAPABILITY_CHIPS.map((c) => (
                <button
                  key={c.query}
                  onClick={() => pickCapability(c.query)}
                  className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-muted transition hover:border-mint hover:text-ink"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </Reveal>

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
            <div className="rounded-card border border-dashed border-line p-10 text-center">
              <p className="text-muted">
                No ready-made agent matches “{query}” — which is exactly what the magic box is for.
              </p>
              <button
                onClick={() => {
                  setDescription(query);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="mt-4 rounded-full bg-mint px-5 py-2.5 text-sm font-semibold text-white hover:bg-mint-deep"
              >
                Describe it — we'll mint it custom
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t, i) => (
                <Reveal key={t.templateId} delay={(i % 6) * 60} as="div">
                  <button
                    onClick={() => grabTemplate(t)}
                    className="card-glow group h-full w-full rounded-card border border-line bg-surface p-5 text-left shadow-card hover:border-mint"
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
                      <span className="font-mono text-[11px] uppercase tracking-wider text-muted/70">
                        {t.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-mint">
                        Add to my agents
                        <span className="transition group-hover:translate-x-0.5">→</span>
                      </span>
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          )}
        </section>

        {/* ================= COMING SOON: the capability ladder ================= */}
        <section className="pb-20">
          <Reveal>
            <div className="mb-8">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber">In development</p>
              <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
                Where this is going: agents that pick up the phone.
              </h2>
              <p className="mt-2 max-w-2xl text-muted">
                The next rungs of the ladder, in build order. Join a waitlist and you'll be first in
                line — your interest also tells us what to build fastest.
              </p>
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {COMING_SOON.map((c, i) => (
              <Reveal key={c.id} delay={i * 120}>
                <div className="flex h-full flex-col rounded-card border border-dashed border-line bg-surface/60 p-5">
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber/15 text-xl">
                      {c.emoji}
                    </span>
                    <span className="rounded-full bg-amber/15 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-amber">
                      coming soon
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">{c.name}</h3>
                  <p className="mt-1.5 flex-1 text-sm text-muted">{c.desc}</p>
                  {waitlist?.id === c.id && waitlist.done ? (
                    <p className="mt-4 text-sm font-semibold text-mint">You're on the list ✅</p>
                  ) : (
                    <form
                      className="mt-4 flex gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.elements.namedItem("email") as HTMLInputElement;
                        joinWaitlist(c.id, c.name, input.value);
                      }}
                    >
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="you@email.com"
                        className="w-full min-w-0 flex-1 rounded-full border border-line bg-ground px-3.5 py-2 text-xs outline-none focus:border-mint"
                        aria-label={`Waitlist email for ${c.name}`}
                      />
                      <button
                        type="submit"
                        className="rounded-full border border-mint px-3.5 py-2 text-xs font-semibold text-mint hover:bg-mint-soft"
                      >
                        Join
                      </button>
                    </form>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
