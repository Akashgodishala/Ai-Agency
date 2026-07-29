"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AgentConfig, Capture, ChatMessage, ChatResponse, RefineResponse } from "@/lib/types";
import { getAgent, saveAgent, saveCapture, listCaptures, deleteAgent, saveInterest } from "@/lib/store";
import { newId } from "@/lib/templates";
import { AgentMark } from "@/components/seal/AgentMark";
import { Rich } from "@/components/chat/Rich";

type Engine = "live" | "demo";

export default function Playground() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [engineDowngraded, setEngineDowngraded] = useState(false);
  const [chatError, setChatError] = useState(false);
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [refineText, setRefineText] = useState("");
  const [refineNote, setRefineNote] = useState("");
  const [refining, setRefining] = useState(false);
  const [knowledgeDraft, setKnowledgeDraft] = useState("");
  const [knowledgeNote, setKnowledgeNote] = useState("");
  const [buyOpen, setBuyOpen] = useState(false);
  const [buyEmail, setBuyEmail] = useState("");
  const [buyDone, setBuyDone] = useState(false);
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Arriving from a card halfway down the collection must not drop you
    // halfway down the playground. ScrollTrigger's pinned sections restore
    // scroll as they tear down, which can undo the router's own reset, so
    // claim the top explicitly and without the page's smooth-scroll easing.
    window.scrollTo({ top: 0, behavior: "auto" });

    // Full reset on id change — this component is reused across navigations.
    setNotFound(false);
    setMessages([]);
    setEngineDowngraded(false);
    setChatError(false);
    setRefineNote("");
    setKnowledgeNote("");
    setBuyOpen(false);
    setBuyDone(false);

    const a = getAgent(params.id);
    if (!a) {
      setConfig(null);
      setNotFound(true);
      return;
    }
    setConfig(a);
    setKnowledgeDraft(a.knowledge);
    setMessages([{ role: "assistant", content: a.greeting }]);
    setCaptures(listCaptures(a.id));

    // Know the engine BEFORE the first message, so demo mode is labeled
    // up front — never discovered after the fact.
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => setEngine(d.engine === "live" ? "live" : "demo"))
      .catch(() => setEngine("demo"));
  }, [params.id]);

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function postChat(next: ChatMessage[]) {
    if (!config) return;
    setBusy(true);
    setChatError(false);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, messages: next }),
      });
      const data = (await res.json()) as ChatResponse;
      if (data.error && !data.reply) throw new Error(data.error);
      if (engine === "live" && data.engine === "demo") setEngineDowngraded(true);
      setEngine(data.engine);
      setMessages([...next, { role: "assistant", content: data.reply || "…" }]);
      if (data.capture) {
        const summary = data.capture.summary;
        // Dedupe: don't refile the same contact for this agent.
        if (!listCaptures(config.id).some((c) => c.summary === summary)) {
          const c: Capture = {
            id: newId(),
            agentId: config.id,
            summary,
            details: data.capture.details,
            at: new Date().toISOString(),
          };
          saveCapture(c);
          setCaptures((prev) => [c, ...prev]);
        }
      }
    } catch {
      // Keep the user's turn in history; surface a system-level error with
      // retry — never fake an agent reply.
      setChatError(true);
    } finally {
      setBusy(false);
    }
  }

  function send(text: string) {
    if (!config || !text.trim() || busy) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text.trim() }];
    setMessages(next);
    setInput("");
    void postChat(next);
  }

  function retry() {
    if (messages[messages.length - 1]?.role === "user") void postChat(messages);
  }

  async function refine() {
    if (!config || !refineText.trim() || refining) return;
    setRefining(true);
    setRefineNote("");
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, instruction: refineText.trim() }),
      });
      const data = (await res.json()) as RefineResponse;
      if (data.config) {
        setConfig(data.config);
        saveAgent(data.config);
        setRefineNote(data.changed || "Updated.");
        setRefineText("");
      } else {
        setRefineNote(data.error || "Couldn't apply that — try rephrasing.");
      }
    } catch {
      setRefineNote("Connection hiccup — try again.");
    } finally {
      setRefining(false);
    }
  }

  function saveKnowledge() {
    if (!config) return;
    const updated = { ...config, knowledge: knowledgeDraft };
    if (saveAgent(updated)) {
      setConfig(updated);
      setKnowledgeNote("Saved — your agent knows this now. Ask it something!");
    } else {
      setKnowledgeNote("Couldn't save — your browser's storage is full. Delete an unused agent and retry.");
    }
  }

  function submitInterest() {
    if (!config || !buyEmail.trim()) return;
    saveInterest({
      agentId: config.id,
      agentName: config.name,
      email: buyEmail.trim(),
      at: new Date().toISOString(),
    });
    setBuyDone(true);
  }

  function exportConfig() {
    if (!config) return;
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.name.toLowerCase().replace(/\s+/g, "-")}.agent.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function removeAgent() {
    if (!config) return;
    if (!confirm(`Delete "${config.name}"? This can't be undone.`)) return;
    deleteAgent(config.id);
    router.push("/agents");
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="text-2xl font-semibold">Agent not found</h1>
        <p className="mt-3 text-muted">Agents are saved in the browser they were created in.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-mint px-5 py-2.5 text-sm font-semibold text-white hover:bg-mint-deep"
        >
          Mint a new agent
        </Link>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-6">
      {/* Demo notice — visible BEFORE any message is sent, plain language,
          no hover required. */}
      {engine === "demo" && (
        <div className="mb-4 rounded-card border border-amber/40 bg-amber/10 px-4 py-3 text-sm">
          <span className="font-semibold">Demo mode.</span>{" "}
          <span className="text-muted">
            Your agent currently answers only from the info you give it (see the Knowledge panel).
            Full AI conversation is coming soon — what you teach it now carries over.
          </span>
        </div>
      )}
      {engineDowngraded && (
        <div className="mb-4 rounded-card border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-muted">
          Live AI is briefly unavailable — recent replies came from the simpler demo engine.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ============ CHAT ============ */}
        <section className="flex h-[72vh] flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card">
          <div className="flex items-center gap-3 border-b border-line bg-raised px-5 py-3.5">
            {/* The agent's own struck mark, not a stock emoji — every one of
                the fifty has an identity, and this is where its owner sees it. */}
            <span className="group grid h-10 w-10 flex-none place-items-center">
              <AgentMark templateId={config.createdFrom} size={38} />
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-display text-lg text-ink">{config.name}</h1>
              <p className="truncate text-xs text-muted">{config.tagline}</p>
            </div>
            {engine && (
              <span
                className={`ml-auto flex-none rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest ${
                  engine === "live" ? "bg-mint-soft text-mint-deep" : "bg-amber/15 text-amber"
                }`}
              >
                {engine === "live" ? "● live AI" : "● demo engine"}
              </span>
            )}
          </div>

          <div ref={streamRef} className="flex-1 space-y-3 overflow-y-auto p-5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto whitespace-pre-wrap rounded-br-md bg-mint text-white"
                    : "mr-auto rounded-bl-md border border-line bg-raised"
                }`}
              >
                {/* The visitor's own words go through verbatim; the agent's
                    reply gets its tables and lists laid out, because a raw
                    pipe table is what a broken demo looks like. */}
                {m.role === "user" ? m.content : <Rich text={m.content} />}
              </div>
            ))}
            {busy && (
              <div className="mr-auto flex gap-1.5 rounded-2xl rounded-bl-md border border-line bg-raised px-4 py-3.5">
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
              </div>
            )}
            {chatError && (
              <div className="mx-auto flex items-center gap-3 rounded-xl border border-red-300 bg-red-500/10 px-4 py-2.5 text-sm text-red-500">
                That message didn't go through.
                <button
                  onClick={retry}
                  className="rounded-full border border-red-300 px-3 py-1 text-xs font-semibold hover:bg-red-500/10"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {messages.length <= 1 && !busy && (
            <div className="flex flex-wrap gap-2 px-5 pb-2">
              {config.suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-mint transition hover:bg-mint-soft"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form
            className="flex gap-2 border-t border-line p-3.5"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message your agent…"
              className="flex-1 rounded-full border border-line bg-ground px-4 py-2.5 text-sm outline-none focus:border-mint"
              aria-label="Message"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="rounded-full bg-mint px-5 py-2.5 text-sm font-semibold text-white hover:bg-mint-deep disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </section>

        {/* ============ SIDE PANEL ============ */}
        <aside className="flex flex-col gap-4">
          {/* GET THIS AGENT — the test-then-buy moment */}
          <div className="rounded-card border border-mint/50 bg-surface p-5 shadow-card">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-mint-deep">
              Like what you see?
            </h2>
            <p className="mt-1.5 text-xs text-muted">
              Test it as much as you want — that's the point. When it's right, this is where you'll
              make it officially yours.
            </p>
            <button
              onClick={() => setBuyOpen(true)}
              className="mt-3 w-full rounded-full bg-mint px-4 py-2.5 text-sm font-semibold text-white hover:bg-mint-deep"
            >
              Get this agent
            </button>
          </div>

          {/* KNOWLEDGE — make it yours */}
          <div className="rounded-card border border-line bg-surface p-5 shadow-card">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
              What it knows
            </h2>
            <p className="mt-1.5 text-xs text-muted">
              {config.knowledge.trim()
                ? "This is your agent's knowledge — edit it any time."
                : "Your agent knows nothing yet. Add notes, FAQs, prices, details — one fact per line works great."}
            </p>
            <textarea
              value={knowledgeDraft}
              onChange={(e) => setKnowledgeDraft(e.target.value)}
              rows={5}
              className="mt-3 w-full rounded-xl border border-line bg-ground p-3 text-xs outline-none focus:border-mint"
              placeholder={"Hours: Mon–Fri 9–6\nPrices: from $25\nPolicy: 24h cancellation…"}
              aria-label="Agent knowledge"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <button
                onClick={saveKnowledge}
                disabled={knowledgeDraft === config.knowledge}
                className="rounded-full border border-mint px-4 py-1.5 text-xs font-semibold text-mint hover:bg-mint-soft disabled:opacity-40"
              >
                Save knowledge
              </button>
              {knowledgeNote && <span className="text-[11px] text-mint-deep">{knowledgeNote}</span>}
            </div>
          </div>

          {/* REFINE */}
          <div className="rounded-card border border-line bg-surface p-5 shadow-card">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
              Refine your agent
            </h2>
            <p className="mt-1.5 text-xs text-muted">
              Tell it how to change, in plain English — “be more formal”, “never discuss prices”,
              “call it Sunny”.
            </p>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void refine();
              }}
            >
              <input
                value={refineText}
                onChange={(e) => setRefineText(e.target.value)}
                placeholder="e.g. keep replies under two sentences"
                className="flex-1 rounded-full border border-line bg-ground px-4 py-2.5 text-sm outline-none focus:border-mint"
                aria-label="Refine instruction"
              />
              <button
                type="submit"
                disabled={refining || !refineText.trim()}
                className="rounded-full border border-mint px-4 py-2 text-sm font-semibold text-mint hover:bg-mint-soft disabled:opacity-40"
              >
                {refining ? "…" : "Apply"}
              </button>
            </form>
            {refineNote && <p className="mt-2.5 text-xs font-medium text-mint-deep">{refineNote}</p>}
          </div>

          {/* INBOX */}
          <div className="rounded-card border border-line bg-surface p-5 shadow-card">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
              Inbox{" "}
              {captures.length > 0 && (
                <span className="ml-1 rounded-full bg-mint-soft px-2 py-0.5 text-[11px] text-mint-deep">
                  {captures.length}
                </span>
              )}
            </h2>
            {captures.length === 0 ? (
              config.captureRules.enabled ? (
                <p className="mt-1.5 text-xs text-muted">
                  Contacts and messages your agent collects will appear here. Try sharing an email
                  address in the chat.
                </p>
              ) : (
                <div className="mt-1.5">
                  <p className="text-xs text-muted">
                    This agent isn't collecting visitor contacts yet.
                  </p>
                  <button
                    onClick={() => {
                      const updated: AgentConfig = {
                        ...config,
                        captureRules: {
                          enabled: true,
                          fields: config.captureRules.fields.length
                            ? config.captureRules.fields
                            : ["name", "email"],
                          trigger:
                            config.captureRules.trigger ||
                            "Whenever the visitor wants follow-up or asks something the knowledge doesn't cover.",
                        },
                      };
                      if (saveAgent(updated)) setConfig(updated);
                    }}
                    className="mt-2 rounded-full border border-mint px-4 py-1.5 text-xs font-semibold text-mint hover:bg-mint-soft"
                  >
                    Turn on contact capture
                  </button>
                </div>
              )
            ) : (
              <ul className="mt-2 space-y-2.5">
                {captures.map((c) => (
                  <li key={c.id} className="rounded-xl border border-line bg-raised p-3">
                    <p className="text-xs font-semibold">{c.summary}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted">{c.details}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* HOUSEKEEPING */}
          <div className="rounded-card border border-line bg-surface p-5 shadow-card">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
              Your agent, your data
            </h2>
            <p className="mt-1.5 text-xs text-muted">
              A public share link and website widget for this agent are coming soon. For now it
              lives right here, saved in this browser.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={exportConfig}
                className="rounded-full border border-line px-4 py-2 text-xs font-semibold hover:border-mint hover:text-mint"
                title="Saves a small file with everything that makes this agent yours"
              >
                Download a backup
              </button>
              <button
                onClick={removeAgent}
                className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-red-500 hover:border-red-400"
              >
                Delete agent
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ============ BUY MODAL ============ */}
      {buyOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-5 backdrop-blur-sm"
          onClick={() => setBuyOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Get this agent"
        >
          <div
            className="w-full max-w-md rounded-card border border-line bg-surface p-6 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-mint-soft text-xl">
                {config.emoji}
              </span>
              <h2 className="font-display text-lg font-semibold">Get {config.name}</h2>
            </div>

            {buyDone ? (
              <div className="mt-4">
                <p className="text-sm">
                  You're on the list. ✅ Your agent stays saved here in the meantime — keep testing
                  and teaching it. We'll email you the moment checkout opens.
                </p>
                <button
                  onClick={() => setBuyOpen(false)}
                  className="mt-5 w-full rounded-full bg-mint px-4 py-2.5 text-sm font-semibold text-white hover:bg-mint-deep"
                >
                  Back to my agent
                </button>
              </div>
            ) : (
              <>
                <p className="mt-3 text-sm text-muted">
                  Straight talk: <span className="font-semibold text-ink">checkout isn't open yet</span>{" "}
                  — we're in early access, and your agent is free to use right here while we build
                  it. Planned pricing:
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex justify-between rounded-xl border border-line bg-raised px-3.5 py-2.5">
                    <span className="font-semibold">Free</span>
                    <span className="text-muted">1 agent · share link · light use</span>
                  </li>
                  <li className="flex justify-between rounded-xl border border-mint bg-mint-soft/50 px-3.5 py-2.5">
                    <span className="font-semibold">Pro ~$19/mo</span>
                    <span className="text-muted">website widget · higher limits</span>
                  </li>
                  <li className="flex justify-between rounded-xl border border-line bg-raised px-3.5 py-2.5">
                    <span className="font-semibold">Business ~$49/mo</span>
                    <span className="text-muted">multiple agents · priority help</span>
                  </li>
                </ul>
                <form
                  className="mt-4 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitInterest();
                  }}
                >
                  <input
                    type="email"
                    required
                    value={buyEmail}
                    onChange={(e) => setBuyEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="flex-1 rounded-full border border-line bg-ground px-4 py-2.5 text-sm outline-none focus:border-mint"
                    aria-label="Your email"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-mint px-5 py-2.5 text-sm font-semibold text-white hover:bg-mint-deep"
                  >
                    Notify me
                  </button>
                </form>
                <p className="mt-2 text-[11px] text-muted">
                  We'll email you once, when checkout opens for this agent.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
