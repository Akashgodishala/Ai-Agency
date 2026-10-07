"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AGENTS,
  DIVISIONS,
  META,
  RUNBOOKS,
  SORTS,
  agentBySlug,
  divisionLabel,
  filterAgents,
  formatCount,
  formatDate,
  type AgencyAgent,
  type AgencySort,
} from "@/lib/agency";
import { MaskedLines } from "@/components/motion/MaskedLines";
import { useReveal } from "@/components/motion/hooks";
import { AgentPlate } from "./AgentPlate";
import { AgentDrawer } from "./AgentDrawer";
import { DivisionBars } from "./DivisionBars";
import { Runbooks } from "./Runbooks";

/**
 * ============================================================================
 * THE AGENCY DASHBOARD — every agent from the open-source roster, on one plate
 * ============================================================================
 *
 * Reads lib/agency/agents.json (see scripts/sync-agency.mjs) and lays it out
 * as: the headline numbers → agents per division (which is also the filter) →
 * search and sort → the roster → the four runbook teams. Selecting an agent
 * opens a panel with everything we know about it and a "Mint this agent"
 * action that hands its description to the existing /create flow.
 *
 * URL state: `?division=`, `?q=` and `?agent=` are read on arrival and written
 * back with replaceState, so a filtered view or a single agent can be linked.
 */

const PENDING_KEY = "agentmint.pendingDescription";
const SORT_IDS = new Set<string>(SORTS.map((s) => s.id));

export function AgencyDashboard() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [division, setDivision] = useState<string | null>(null);
  const [sort, setSort] = useState<AgencySort>("division");
  const [selected, setSelected] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const headRef = useReveal<HTMLDivElement>({ selector: "[data-r]" });

  // Arrive at a linked state.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const d = p.get("division");
    if (d && DIVISIONS.some((x) => x.id === d)) setDivision(d);
    const q = p.get("q");
    if (q) setQuery(q.slice(0, 120));
    const s = p.get("sort");
    if (s && SORT_IDS.has(s)) setSort(s as AgencySort);
    const a = p.get("agent");
    if (a && agentBySlug(a)) setSelected(a);
    setHydrated(true);
  }, []);

  // Write the state back without touching history.
  useEffect(() => {
    if (!hydrated) return;
    const p = new URLSearchParams();
    if (division) p.set("division", division);
    if (query.trim()) p.set("q", query.trim());
    if (sort !== "division") p.set("sort", sort);
    if (selected) p.set("agent", selected);
    const qs = p.toString();
    const url = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
    if (url !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, "", url);
    }
  }, [hydrated, division, query, sort, selected]);

  const results = useMemo(
    () => filterAgents(AGENTS, { query, division, sort }),
    [query, division, sort]
  );

  const agent = agentBySlug(selected) ?? null;

  const close = useCallback(() => {
    const slug = selected;
    setSelected(null);
    // Hand focus back to the plate that opened the panel.
    if (slug) {
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>(`[data-slug="${slug}"]`)?.focus();
      });
    }
  }, [selected]);

  function mint(a: AgencyAgent) {
    // The /create flow reads this key and asks its follow-up questions. The
    // server caps a description at 2,000 characters; stay comfortably under.
    const description = `${a.name}: ${a.description}`.slice(0, 1800);
    try {
      sessionStorage.setItem(PENDING_KEY, description);
    } catch {
      /* storage blocked — /create will send the visitor back to the start */
    }
    router.push("/create");
  }

  const total = AGENTS.length;
  const divisionName = division ? divisionLabel(division) : null;

  return (
    <>
      {/* ---- Headline ---- */}
      <section className="relative overflow-hidden border-b border-rule" aria-labelledby="agency-title">
        <div className="plate-light" aria-hidden="true" />
        <div ref={headRef} className="relative mx-auto flex max-w-sheet flex-col gap-5 px-6 pb-14 pt-14 lg:pt-20">
          <p data-r className="assay opacity-0">
            The Agency · open-source roster · {META.repo}
          </p>
          <MaskedLines as="h1" id="agency-title" className="text-display max-w-[17ch]">
            Every agent in the agency, on one plate.
          </MaskedLines>
          <p data-r className="max-w-measure text-muted opacity-0">
            {formatCount(total)} specialist personas gathered from the open-source Agency roster —
            engineers, marketers, analysts, game developers, and a long tail of specialists.
            Search them, filter by division, read what each one covers, and mint any of them
            into a working agent of your own.
          </p>

          <dl data-r className="mt-4 grid grid-cols-2 gap-px border border-rule bg-rule opacity-0 md:grid-cols-4">
            <Stat label="Agents" value={formatCount(total)} />
            <Stat label="Divisions" value={String(DIVISIONS.length)} />
            <Stat label="Team runbooks" value={String(RUNBOOKS.length)} />
            <Stat
              label="Roster as of"
              value={formatDate(META.commitDate)}
              note={META.commit ? `commit ${META.commit.slice(0, 7)}` : undefined}
              compact
            />
          </dl>
        </div>
      </section>

      {/* ---- Divisions ---- */}
      <section className="border-b border-rule py-14" aria-labelledby="divisions-title">
        <div className="mx-auto flex max-w-sheet flex-col gap-8 px-6">
          <div className="flex flex-col gap-3">
            <p className="assay">Agents per division</p>
            <h2 id="divisions-title" className="font-display text-head">
              Where the roster is deepest.
              <span className="block text-muted">
                {" "}
                Select a division to filter everything below.
              </span>
            </h2>
          </div>
          <DivisionBars divisions={DIVISIONS} active={division} onPick={setDivision} />
        </div>
      </section>

      {/* ---- Roster ---- */}
      <section className="py-14" aria-labelledby="roster-title">
        <div className="mx-auto max-w-sheet px-6">
          <div className="flex flex-col gap-3">
            <p className="assay">The roster</p>
            <h2 id="roster-title" className="font-display text-head">
              {divisionName ? `${divisionName} division.` : "All divisions."}
              <span className="text-muted">
                {" "}
                {results.length === total
                  ? `${formatCount(total)} agents.`
                  : `${formatCount(results.length)} of ${formatCount(total)} agents.`}
              </span>
            </h2>
          </div>

          {/* Controls. Sticks under the nav; stays below any pinned section. */}
          <div className="sticky top-[57px] z-sticky -mx-6 mt-6 border-y border-rule bg-ink/92 px-6 py-3 backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${formatCount(total)} agents`}
                aria-label="Search agents"
                type="search"
                className="w-full border border-rule bg-plate px-4 py-2.5 text-sm text-paper outline-none transition-colors duration-200 ease-struck placeholder:text-dim focus:border-mint-deep sm:max-w-xs [&::-webkit-search-cancel-button]:appearance-none"
              />
              <div className="flex flex-wrap items-center gap-1.5">
                {SORTS.map((s) => {
                  const active = sort === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSort(s.id)}
                      aria-pressed={active}
                      className={`assay px-3.5 py-2 normal-case tracking-[0.08em] transition-colors duration-200 ease-struck ${
                        active
                          ? "strike-btn"
                          : "border border-rule text-muted hover:border-mint hover:text-paper"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
                {(division || query.trim()) && (
                  <button
                    type="button"
                    onClick={() => {
                      setDivision(null);
                      setQuery("");
                    }}
                    className="assay px-3.5 py-2 normal-case tracking-[0.08em] text-mint transition-colors duration-200 ease-struck hover:text-paper"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="mt-10 border border-dashed border-rule p-12 text-center">
              <p className="text-muted">
                No agent on the roster matches “{query.trim()}”
                {divisionName ? ` in ${divisionName}` : ""}.
              </p>
              <button
                type="button"
                onClick={() => {
                  setDivision(null);
                  setQuery("");
                }}
                className="strike-ghost assay mt-5 inline-block px-6 py-3 normal-case tracking-[0.08em]"
              >
                Show every agent
              </button>
            </div>
          ) : (
            <div
              key={`${division ?? "all"}-${sort}-${query.trim()}`}
              className="mt-8 grid grid-cols-1 gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3"
            >
              {results.map((a) => (
                <AgentPlate key={a.slug} agent={a} onOpen={() => setSelected(a.slug)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---- Runbooks ---- */}
      {RUNBOOKS.length > 0 && (
        <section className="border-t border-rule py-14 lg:py-20" aria-labelledby="runbooks-title">
          <div className="mx-auto flex max-w-sheet flex-col gap-8 px-6">
            <div className="flex flex-col gap-3">
              <p className="assay">Teams</p>
              <h2 id="runbooks-title" className="font-display text-head max-w-[30ch]">
                Four runbooks that assemble the roster into a team.
                <span className="text-muted"> Select any member to open their plate.</span>
              </h2>
            </div>
            <Runbooks runbooks={RUNBOOKS} onOpen={setSelected} />
          </div>
        </section>
      )}

      {/* ---- Provenance ---- */}
      <section className="border-t border-rule py-12" aria-label="Where this roster comes from">
        <div className="mx-auto flex max-w-sheet flex-col gap-3 px-6 text-sm text-dim">
          <p className="max-w-measure">
            The roster is{" "}
            <a
              href={META.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted underline decoration-rule underline-offset-4 transition-colors hover:text-paper hover:decoration-mint"
            >
              {META.repo}
            </a>
            , released under the {META.license} license. Names, descriptions and section
            lists are reproduced from it; the personas themselves live upstream. This copy
            reflects commit{" "}
            <span className="font-mono text-muted">{META.commit ? META.commit.slice(0, 7) : "unknown"}</span>{" "}
            of {formatDate(META.commitDate)} and is refreshed by hand with{" "}
            <span className="font-mono text-muted">npm run sync:agency</span>.
          </p>
        </div>
      </section>

      <AgentDrawer agent={agent} onClose={close} onMint={mint} />
    </>
  );
}

/**
 * One headline number. Label in the assay voice, value in the display face.
 * `compact` is for a value that is words rather than a number (a date), which
 * would otherwise wrap into three lines on a phone.
 */
function Stat({
  label,
  value,
  note,
  compact = false,
}: {
  label: string;
  value: string;
  note?: string;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5 bg-plate px-5 py-5">
      <dt className="assay">{label}</dt>
      <dd className="flex flex-col gap-1">
        <span
          className={`whitespace-nowrap font-display leading-none tracking-tight ${
            compact ? "text-[1.45rem] sm:text-[1.9rem]" : "text-[2rem] sm:text-[2.4rem]"
          }`}
        >
          {value}
        </span>
        {note && <span className="font-mono text-xs text-dim">{note}</span>}
      </dd>
    </div>
  );
}
