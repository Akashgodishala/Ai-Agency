"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TEMPLATES } from "@/lib/templates";
import { instantiateTemplate } from "@/lib/templates";
import { saveAgent } from "@/lib/store";

const EXAMPLES = [
  "An agent for my bakery that answers questions and takes custom-cake requests",
  "A study buddy that quizzes me on my biology notes",
  "A trip planner for my two weeks in Japan",
  "An assistant for my Etsy shop that helps buyers pick gifts",
];

export default function Landing() {
  const router = useRouter();
  const [description, setDescription] = useState("");

  function startCreate(desc: string) {
    const d = desc.trim();
    if (!d) return;
    sessionStorage.setItem("agentmint.pendingDescription", d);
    router.push("/create");
  }

  function grabTemplate(templateId: string) {
    const t = TEMPLATES.find((x) => x.templateId === templateId);
    if (!t) return;
    const config = instantiateTemplate(t);
    saveAgent(config);
    router.push(`/playground/${config.id}`);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5">
      {/* HERO — the magic box is the thesis */}
      <section id="create" className="py-16 sm:py-24 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-mint">
          Your own AI agent · no coding · minutes
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold sm:text-6xl">
          Describe it. <span className="text-mint">Mint it.</span> Use it.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
          Tell us what you need — an agent for your shop, your studies, your trip, your job hunt —
          and get a working AI agent you can chat with right away.
        </p>

        <form
          className="mx-auto mt-10 max-w-2xl"
          onSubmit={(e) => {
            e.preventDefault();
            startCreate(description);
          }}
        >
          <div className="rounded-card border border-line bg-surface p-3 shadow-card focus-within:border-mint">
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
              placeholder="What should your agent do? e.g. “Answer questions about my pottery classes and collect sign-ups”"
              className="w-full resize-none bg-transparent px-2 py-1.5 text-base outline-none placeholder:text-muted/70"
              aria-label="Describe your agent"
            />
            <div className="flex items-center justify-between gap-3 px-2 pb-1">
              <span className="text-xs text-muted">Enter to start · Shift+Enter for a new line</span>
              <button
                type="submit"
                disabled={!description.trim()}
                className="rounded-full bg-mint px-5 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-mint-deep disabled:cursor-not-allowed disabled:opacity-40"
              >
                Mint my agent →
              </button>
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
      </section>

      {/* HOW IT WORKS */}
      <section className="grid gap-4 border-y border-line py-10 sm:grid-cols-3">
        {[
          ["1", "Describe", "Say what your agent should do, in your own words. Answer two or three quick questions."],
          ["2", "Mint", "The factory builds your agent — its personality, its rules, and what it knows (add your notes, docs, or website)."],
          ["3", "Use", "Chat with it instantly. Refine it in plain English. Publishing to a link & website widget is coming next."],
        ].map(([n, title, body]) => (
          <div key={n} className="px-2">
            <div className="font-mono text-xs font-bold tracking-widest text-mint">STEP {n}</div>
            <h3 className="mt-2 font-display text-lg font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm text-muted">{body}</p>
          </div>
        ))}
      </section>

      {/* GALLERY */}
      <section id="gallery" className="py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Or grab a ready-made agent</h2>
            <p className="mt-2 text-muted">
              Start from the shelf, then make it yours — add your info, change its personality.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.templateId}
              onClick={() => grabTemplate(t.templateId)}
              className="group rounded-card border border-line bg-surface p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-mint"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-mint-soft text-xl">
                  {t.emoji}
                </span>
                <span className="rounded-full border border-line px-2.5 py-1 text-[11px] text-muted">
                  {t.audience}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{t.name}</h3>
              <p className="mt-1.5 text-sm text-muted">{t.tagline}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-mint">
                Grab this agent
                <span className="transition group-hover:translate-x-0.5">→</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
