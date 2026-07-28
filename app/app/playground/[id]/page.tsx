"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AgentConfig, Capture, ChatMessage, ChatResponse, RefineResponse } from "@/lib/types";
import { getAgent, saveAgent, saveCapture, listCaptures, deleteAgent } from "@/lib/store";
import { newId } from "@/lib/templates";

export default function Playground() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [engine, setEngine] = useState<"live" | "demo" | null>(null);
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [refineText, setRefineText] = useState("");
  const [refineNote, setRefineNote] = useState("");
  const [refining, setRefining] = useState(false);
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const a = getAgent(params.id);
    if (!a) {
      setNotFound(true);
      return;
    }
    setConfig(a);
    setMessages([{ role: "assistant", content: a.greeting }]);
    setCaptures(listCaptures(a.id));
  }, [params.id]);

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    if (!config || !text.trim() || busy) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text.trim() }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, messages: next }),
      });
      const data = (await res.json()) as ChatResponse;
      setEngine(data.engine);
      setMessages([...next, { role: "assistant", content: data.reply || "…" }]);
      if (data.capture) {
        const c: Capture = {
          id: newId(),
          agentId: config.id,
          summary: data.capture.summary,
          details: data.capture.details,
          at: new Date().toISOString(),
        };
        saveCapture(c);
        setCaptures((prev) => [c, ...prev]);
      }
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "(Connection hiccup — try that again.)" },
      ]);
    } finally {
      setBusy(false);
    }
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
        <p className="mt-3 text-muted">
          Agents currently live in the browser they were created in.
        </p>
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
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[1fr_360px]">
      {/* CHAT */}
      <section className="flex h-[72vh] flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card">
        <div className="flex items-center gap-3 border-b border-line bg-raised px-5 py-3.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint-soft text-lg">
            {config.emoji}
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-display text-base font-semibold">{config.name}</h1>
            <p className="truncate text-xs text-muted">{config.tagline}</p>
          </div>
          {engine && (
            <span
              className={`ml-auto rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${
                engine === "live" ? "bg-mint-soft text-mint-deep" : "bg-amber/15 text-amber"
              }`}
              title={
                engine === "live"
                  ? "Powered by a live AI model"
                  : "Demo engine — connect an AI key for full intelligence"
              }
            >
              {engine === "live" ? "live AI" : "demo"}
            </span>
          )}
        </div>

        <div ref={streamRef} className="flex-1 space-y-3 overflow-y-auto p-5">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "ml-auto rounded-br-md bg-mint text-white"
                  : "mr-auto rounded-bl-md border border-line bg-raised"
              }`}
            >
              {m.content}
            </div>
          ))}
          {busy && (
            <div className="mr-auto flex gap-1.5 rounded-2xl rounded-bl-md border border-line bg-raised px-4 py-3.5">
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 px-5 pb-2">
            {config.suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => void send(q)}
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
            void send(input);
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

      {/* SIDE PANEL */}
      <aside className="flex flex-col gap-4">
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
            <p className="mt-1.5 text-xs text-muted">
              {config.captureRules.enabled
                ? "Leads and messages your agent captures will appear here. Try sharing an email address in the chat."
                : "This agent isn't set up to capture contacts. Ask in Refine to enable it."}
            </p>
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

        <div className="rounded-card border border-line bg-surface p-5 shadow-card">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
            Publish
          </h2>
          <p className="mt-1.5 text-xs text-muted">
            A shareable link and website widget for this agent are{" "}
            <span className="font-semibold text-ink">coming in the next phase</span>. For now it
            lives here in your playground.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={exportConfig}
              className="rounded-full border border-line px-4 py-2 text-xs font-semibold hover:border-mint hover:text-mint"
            >
              Export config
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
  );
}
