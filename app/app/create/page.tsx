"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { GenerateResponse } from "@/lib/types";
import { saveAgent } from "@/lib/store";

type Stage = "loading-questions" | "questions" | "building" | "error";

export default function CreatePage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState<Stage>("loading-questions");
  const [engine, setEngine] = useState<"live" | "demo">("demo");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [knowledge, setKnowledge] = useState("");
  const [knowledgeUrl, setKnowledgeUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const desc = sessionStorage.getItem("agentmint.pendingDescription") ?? "";
    if (!desc) {
      router.replace("/");
      return;
    }
    setDescription(desc);
    void fetchQuestions(desc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchQuestions(desc: string) {
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: desc }),
      });
      const data = (await res.json()) as GenerateResponse;
      if (data.followupQuestions?.length) {
        setQuestions(data.followupQuestions);
        setAnswers(new Array(data.followupQuestions.length).fill(""));
        setEngine(data.engine);
        setStage("questions");
      } else {
        throw new Error(data.error || "No questions returned");
      }
    } catch {
      setError("Couldn't reach the factory. Check your connection and try again.");
      setStage("error");
    }
  }

  async function build() {
    setStage("building");
    try {
      const answerMap: Record<string, string> = {};
      questions.forEach((q, i) => {
        if (answers[i]?.trim()) answerMap[q] = answers[i].trim();
      });
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          answers: answerMap,
          knowledge: knowledge.trim() || undefined,
          knowledgeUrl: knowledgeUrl.trim() || undefined,
        }),
      });
      const data = (await res.json()) as GenerateResponse;
      if (!data.config) throw new Error(data.error || "The factory returned nothing.");
      saveAgent(data.config);
      sessionStorage.removeItem("agentmint.pendingDescription");
      router.push(`/playground/${data.config.id}`);
    } catch {
      setError("Something went wrong while building. Your answers are still here — try again.");
      setStage("questions");
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-12">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-mint">Minting your agent</p>
      <h1 className="mt-3 text-3xl font-semibold">Almost there — a few quick questions.</h1>
      <p className="mt-3 rounded-card border border-line bg-surface p-4 text-sm text-muted">
        <span className="font-semibold text-ink">Your agent:</span> {description}
      </p>

      {engine === "demo" && stage !== "loading-questions" && (
        <p className="mt-3 rounded-card border border-amber/40 bg-amber/10 px-4 py-3 text-xs text-muted">
          <span className="font-semibold text-ink">Demo engine.</span> No AI key is connected yet, so
          a simplified engine builds and runs your agent. Everything works — connect a key to make it
          fully intelligent.
        </p>
      )}

      {stage === "loading-questions" && (
        <div className="mt-10 flex items-center gap-3 text-muted">
          <Spinner /> Reading your description…
        </div>
      )}

      {stage === "error" && (
        <div className="mt-10">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={() => {
              setStage("loading-questions");
              void fetchQuestions(description);
            }}
            className="mt-4 rounded-full bg-mint px-5 py-2.5 text-sm font-semibold text-white hover:bg-mint-deep"
          >
            Try again
          </button>
        </div>
      )}

      {(stage === "questions" || stage === "building") && (
        <form
          className="mt-8 flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            void build();
          }}
        >
          {questions.map((q, i) => (
            <label key={i} className="block">
              <span className="text-sm font-semibold">{q}</span>
              <textarea
                value={answers[i] ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => prev.map((a, j) => (j === i ? e.target.value : a)))
                }
                rows={2}
                className="mt-2 w-full rounded-card border border-line bg-surface p-3 text-sm outline-none focus:border-mint"
                placeholder="Optional — skip anything you're unsure about"
              />
            </label>
          ))}

          <div className="rounded-card border border-line bg-raised p-4">
            <span className="text-sm font-semibold">What should it know?</span>
            <p className="mt-1 text-xs text-muted">
              Paste anything useful — FAQs, notes, product lists, policies. And/or give a public web
              page to read.
            </p>
            <textarea
              value={knowledge}
              onChange={(e) => setKnowledge(e.target.value)}
              rows={5}
              className="mt-3 w-full rounded-card border border-line bg-surface p-3 text-sm outline-none focus:border-mint"
              placeholder={"Hours: Mon–Fri 9–6\nPrices: from $25\nPolicy: 24h cancellation…"}
            />
            <input
              value={knowledgeUrl}
              onChange={(e) => setKnowledgeUrl(e.target.value)}
              type="url"
              className="mt-2 w-full rounded-card border border-line bg-surface p-3 text-sm outline-none focus:border-mint"
              placeholder="https://your-website.com (optional)"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={stage === "building"}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-mint px-6 py-3 font-semibold text-white shadow-card hover:bg-mint-deep disabled:opacity-60"
          >
            {stage === "building" ? (
              <>
                <Spinner light /> Minting your agent…
              </>
            ) : (
              "Build my agent →"
            )}
          </button>
        </form>
      )}
    </div>
  );
}

function Spinner({ light }: { light?: boolean }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent ${
        light ? "border-white" : "border-mint"
      }`}
      aria-hidden
    />
  );
}
