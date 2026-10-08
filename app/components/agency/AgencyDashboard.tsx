"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  initialKey,
  initialStateFrom,
  type AgencyAgent,
  type AgencyInitial,
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
 * search and sort → the roster, a page at a time → the four runbook teams.
 * Selecting an agent opens a panel with everything we know about it and a
 * "Mint this agent" action that hands its description to the existing
 * /create flow.
 *
 * URL state: the page reads `?division=`, `?q=`, `?sort=` and `?agent=` on
 * the server and passes them in as `initial`, so a shared link paints right
 * the first time. After that the live URL is the source of truth:
 *
 *   - Changes are written back with replaceState, debounced — Safari caps
 *     history writes at a hundred per half minute and throws past it, so a
 *     keystroke must never be a history write of its own. The call passes a
 *     null state so Next's patched replaceState keeps its own router state
 *     and tells `useSearchParams` about the new URL.
 *   - When the URL changes under us for any other reason — Back from /create,
 *     the nav's own /agency link while a filter is on — `useSearchParams`
 *     moves and the state is adopted from it. Our own writes echo back
 *     through the same hook and are recognised and ignored, so typing is
 *     never clobbered by a stale echo.
 */

const PENDING_KEY = "agentmint.pendingDescription";
/** Plates shown before "show more". Enough to browse, not a 90,000px page. */
const PAGE = 48;
const URL_DEBOUNCE_MS = 350;
/** The condensed nav plus its rule — what the sticky controls tuck under. */
const NAV_OFFSET = 57;

export function AgencyDashboard({ initial }: { initial: AgencyInitial }) {
  const router = useRouter();
  const [query, setQuery] = useState(initial.query);
  const [division, setDivision] = useState<string | null>(initial.division);
  const [sort, setSort] = useState<AgencySort>(initial.sort);
  const [selected, setSelected] = useState<string | null>(initial.agent);
  const [mintError, setMintError] = useState("");

  const openerRef = useRef<HTMLElement | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const rosterRef = useRef<HTMLElement>(null);
  const rosterTitleRef = useRef<HTMLHeadingElement>(null);
  const headRef = useReveal<HTMLDivElement>({ selector: "[data-r]" });

  // The last state this component put in the URL (or arrived with). A URL
  // change that matches it is our own write echoing back; anything else is a
  // navigation to adopt.
  const writtenRef = useRef<string>(initialKey(initial));

  // ---- Adopt the URL when something other than us changes it ----
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  useEffect(() => {
    const fromUrl = initialStateFrom(Object.fromEntries(new URLSearchParams(search)));
    const key = initialKey(fromUrl);
    if (key === writtenRef.current) return;
    writtenRef.current = key;
    setQuery(fromUrl.query);
    setDivision(fromUrl.division);
    setSort(fromUrl.sort);
    setSelected(fromUrl.agent);
  }, [search]);

  // ---- URL write-back, debounced and never allowed to throw ----
  useEffect(() => {
    const t = window.setTimeout(() => {
      // Start from what is there, so a campaign parameter or a fragment that
      // arrived with the visitor survives the rewrite.
      const p = new URLSearchParams(window.location.search);
      for (const k of ["division", "q", "sort", "agent"]) p.delete(k);
      if (division) p.set("division", division);
      if (query.trim()) p.set("q", query.trim());
      if (sort !== "division") p.set("sort", sort);
      if (selected) p.set("agent", selected);
      const qs = p.toString();
      const url = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      writtenRef.current = initialKey({ query: query.trim().slice(0, 120), division, sort, agent: selected });
      if (url === current) return;
      try {
        // A null state lets Next's patched replaceState carry its own router
        // state across and update the canonical URL it navigates from.
        window.history.replaceState(null, "", url);
      } catch {
        /* a throttling browser leaves the address bar stale, nothing worse */
      }
    }, URL_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [division, query, sort, selected]);

  // ---- The roster ----
  const results = useMemo(
    () => filterAgents(AGENTS, { query, division, sort }),
    [query, division, sort]
  );
  const filterKey = `${division ?? ""}|${sort}|${query.trim().toLowerCase()}`;

  // How many plates are shown, reset whenever the filter changes. Kept with
  // the key it belongs to so the reset happens in the same render as the new
  // results rather than one paint later.
  const [shown, setShown] = useState({ key: filterKey, limit: PAGE });
  const limit = shown.key === filterKey ? shown.limit : PAGE;
  const visible = results.slice(0, limit);
  const focusIndexRef = useRef<number | null>(null);

  // Typing while scrolled deep into the roster: the controls are stuck under
  // the nav, and when the results shrink beneath them the stuck bar would be
  // carried off the top of the screen. Keep the roster's head in view instead.
  const lastFilter = useRef(filterKey);
  useEffect(() => {
    if (lastFilter.current === filterKey) return;
    lastFilter.current = filterKey;
    const el = rosterRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    if (window.scrollY > top) window.scrollTo({ top, behavior: "auto" });
  }, [filterKey]);

  // "Show more" hands focus to the first newly revealed plate.
  useEffect(() => {
    const i = focusIndexRef.current;
    if (i === null) return;
    focusIndexRef.current = null;
    document
      .querySelector<HTMLElement>(`[data-plate-index="${i}"]`)
      ?.focus({ preventScroll: false });
  }, [limit]);

  function showMore(all: boolean) {
    focusIndexRef.current = visible.length;
    setShown({ key: filterKey, limit: all ? results.length : limit + PAGE });
  }

  function clearFilters() {
    setDivision(null);
    setQuery("");
    // Both "clear" controls unmount themselves; focus must land somewhere real.
    searchRef.current?.focus();
  }

  // ---- The panel ----
  const agent = agentBySlug(selected) ?? null;

  const open = useCallback((slug: string, opener?: HTMLElement | null) => {
    openerRef.current = opener ?? null;
    setMintError("");
    setSelected(slug);
  }, []);

  const close = useCallback(() => {
    setSelected(null);
    setMintError("");
    const opener = openerRef.current;
    openerRef.current = null;
    // After the panel has unmounted and the page is no longer inert.
    requestAnimationFrame(() => {
      if (opener && opener.isConnected) opener.focus();
      else rosterTitleRef.current?.focus({ preventScroll: true });
    });
  }, []);

  function mint(a: AgencyAgent) {
    // The /create flow reads this key and asks its follow-up questions. The
    // server caps a description at 2,000 characters; stay comfortably under.
    const description = `${a.name}: ${a.description}`.slice(0, 1800);
    try {
      sessionStorage.setItem(PENDING_KEY, description);
      if (sessionStorage.getItem(PENDING_KEY) !== description) throw new Error("not stored");
    } catch {
      // /create would only bounce back to the home page, so say why instead.
      setMintError(
        "This browser blocks site storage, so the description can't be handed to the minting flow. Copy it from above and paste it into the field on the home page instead."
      );
      return;
    }
    router.push("/create");
  }

  const total = AGENTS.length;
  const divisionName = division ? divisionLabel(division) : null;
  const filtered = results.length !== total;

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
      <section ref={rosterRef} className="py-14" aria-labelledby="roster-title">
        <div className="mx-auto max-w-sheet px-6">
          <div className="flex flex-col gap-3">
            <p className="assay">The roster</p>
            <h2 id="roster-title" ref={rosterTitleRef} tabIndex={-1} className="font-display text-head outline-none">
              {divisionName ? `${divisionName} division.` : "All divisions."}
              <span className="text-muted">
                {" "}
                {filtered
                  ? `${formatCount(results.length)} of ${formatCount(total)} agents.`
                  : `${formatCount(total)} agents.`}
              </span>
            </h2>
            {/* What a screen reader hears when the filter changes. */}
            <p role="status" aria-live="polite" className="sr-only">
              {results.length === 0
                ? "No agents match."
                : filtered
                  ? `${results.length} of ${total} agents match. Showing ${visible.length}.`
                  : `All ${total} agents. Showing ${visible.length}.`}
            </p>
          </div>

          {/* Controls. Sticks under the nav; stays below any pinned section. */}
          <div className="sticky top-[57px] z-sticky -mx-6 mt-6 border-y border-rule bg-ink/90 px-6 py-3 backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${formatCount(total)} agents`}
                aria-label="Search agents"
                type="search"
                className="w-full border border-rule bg-plate px-4 py-2.5 text-sm text-paper outline-none transition-colors duration-200 ease-struck placeholder:text-dim focus:border-mint-deep sm:max-w-xs [&::-webkit-search-cancel-button]:appearance-none"
              />
              {/* One row that scrolls sideways on a phone, so the stuck bar
                  stays short instead of stacking into a quarter of the screen.
                  The right edge fades so a clipped button reads as "more". */}
              <div
                className="-mx-6 flex items-center gap-1.5 overflow-x-auto px-6 pb-0.5 [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] sm:mx-0 sm:pl-0 sm:pr-8"
                role="group"
                aria-label="Sort"
              >
                {SORTS.map((s) => {
                  const active = sort === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSort(s.id)}
                      aria-pressed={active}
                      className={`assay shrink-0 whitespace-nowrap px-3.5 py-2 normal-case tracking-[0.08em] transition-colors duration-200 ease-struck ${
                        active
                          ? "strike-btn"
                          : "border border-rule text-muted hover:border-mint hover:text-paper"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
              {/* Outside the scroller and the Sort group, so it is always in
                  view and never announced as a sort option. */}
              {(division || query.trim()) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="assay shrink-0 self-start whitespace-nowrap px-3.5 py-2 normal-case tracking-[0.08em] text-mint transition-colors duration-200 ease-struck hover:text-paper sm:self-auto"
                >
                  Clear filters
                </button>
              )}
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
                onClick={clearFilters}
                className="strike-ghost assay mt-5 inline-block px-6 py-3 normal-case tracking-[0.08em]"
              >
                Show every agent
              </button>
            </div>
          ) : (
            <>
              <div className="mt-8 grid grid-cols-1 gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((a, i) => (
                  <AgentPlate key={a.slug} agent={a} index={i} onOpen={(el) => open(a.slug, el)} />
                ))}
              </div>

              {results.length > visible.length && (
                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
                  <p className="assay">
                    Showing {formatCount(visible.length)} of {formatCount(results.length)}
                  </p>
                  <button
                    type="button"
                    onClick={() => showMore(false)}
                    className="strike-ghost assay px-6 py-3 normal-case tracking-[0.08em]"
                  >
                    Show {Math.min(PAGE, results.length - visible.length)} more
                  </button>
                  <button
                    type="button"
                    onClick={() => showMore(true)}
                    className="assay px-3 py-3 normal-case tracking-[0.08em] text-mint transition-colors duration-200 ease-struck hover:text-paper"
                  >
                    Show all {formatCount(results.length)}
                  </button>
                </div>
              )}
            </>
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
            <Runbooks runbooks={RUNBOOKS} onOpen={open} />
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
              <span className="sr-only"> (opens in a new tab)</span>
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

      <AgentDrawer agent={agent} onClose={close} onMint={mint} mintError={mintError} />
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
