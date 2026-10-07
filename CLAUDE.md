# AgentMint — working state

Describe the work in plain English, mint a working AI agent, test it free, then
subscribe. Live at https://agentmint-olive.vercel.app.

This file is the running record of where the build is. Read it first.

## Where things stand

| Round / Phase | Status | What it was |
| --- | --- | --- |
| **Round 0 — safe to go public** | **CLOSED** | Credit-drain hardening, workflow credential hardening, full git-history secret audit. Verdict reached: `GREEN AND SAFE TO FLIP PUBLIC`. |
| **Phase A — motion foundation** | **DONE** | Lenis smooth scroll wired to GSAP ScrollTrigger, one central motion module, reduced motion respected globally. |
| **Phase B — The Re-Strike** | **SHIPPED** | Dark engraved art direction across the whole site, coin hero, founder film moved out of the hero, custom cursor, preloader. |
| **The Agency dashboard** | **BUILT** | `/agency`: every agent from the open-source `msitarzewski/agency-agents` roster (282 at last sync) gathered into one searchable dashboard, with a sync script that regenerates the data. |

## Layout

    app/                      the Next.js 14 App Router application
      app/                    routes: /, /agents, /create, /playground/[id], /api/*
      components/motion/      gsap.ts, SmoothScroll.tsx, MaskedLines.tsx,
                              Cursor.tsx, Preloader.tsx
      components/seal/        SealCanvas.tsx (the coin), AgentMark.tsx
      components/site/        page sections
      components/chat/        the playground transcript
      components/agency/      the /agency dashboard: AgencyDashboard, AgentPlate,
                              AgentDrawer, DivisionBars, Runbooks, AgencyMark
      lib/agency/             agents.json (generated — never hand-edit) + index.ts
      scripts/sync-agency.mjs regenerates lib/agency/agents.json from upstream
      lib/design/tokens.ts    THE source of truth for colour, type, motion
      lib/design/guilloche.ts the engraving engine that draws the coin
      lib/ratelimit.ts        durable per-IP + global limits
      lib/ai-guard.ts         the single gate in front of every paid call
    docs/                     vision, spec, roadmap, founder guide
    archive/                  superseded material

## Design — the single source of truth

`lib/design/tokens.ts` and the `:root` block in `app/globals.css` are the only
two places a colour is named, and they mirror each other. Tailwind maps
semantic names (`paper`, `ink`, `plate`, `mint`, `dim`…) onto those variables,
so **no component may write a hex value** — `grep '#[0-9A-Fa-f]' components/`
returns nothing, and it should stay that way. Rebranding is a two-file edit.

The direction is a banknote engraver's studio at night: ink black ground, cream
paper type, one molten orange accent. Depth comes from engraved line and heat,
never from a gradient wash. Banned on sight: pastel SaaS gradients,
glassmorphism, purple-blue AI palettes, emoji, stock or generated imagery.

**Contrast is a constraint, not a preference.** Every text/background pair in
the palette clears WCAG AA (4.5:1) on the ink ground — the lowest is `dim` on
`plate` at 4.84:1. Two rules follow from it and are easy to undo by accident:

- The accent is `#FF6B1A`, not the old light-ground `#F4560D`. The original
  only reached 5.83:1 on ink and less on a raised plate.
- Type on a filled accent is **ink, never white**. White on the accent is
  2.85:1 and fails; ink on it is 6.95:1. This is also why `.strike-btn` hovers
  by lifting rather than darkening — darkening to `mint-deep` drops small type
  to 3.91:1.

Re-run the numbers after any palette change rather than eyeballing them.

## Motion

`components/motion/gsap.ts` is the **only** place `gsap.registerPlugin` is
called. Import `gsap`, `ScrollTrigger`, `Flip`, and `prefersReducedMotion` from
there — never from `"gsap"` directly, or plugins register more than once.

`components/motion/SmoothScroll.tsx` mounts once in the root layout and owns the
Lenis instance. Lenis has no clock of its own: the GSAP ticker advances it and
every Lenis scroll calls `ScrollTrigger.update`. Break that wiring and every
scroll-linked animation on the site silently freezes.

Under `prefers-reduced-motion: reduce` Lenis is never constructed — smooth
scrolling is itself the animation being declined — and the preference is re-read
if it changes while the page is open.

There is deliberately **no** `scroll-behavior: smooth` in `globals.css`. It
fought Lenis over the same jump. Anchors are Lenis's job now (`anchors: true`);
without Lenis they resolve instantly, which is right both under reduced motion
and before hydration.

`allowNestedScroll: true` is what keeps the playground transcript scrolling on
its own instead of moving the page. Don't remove it without retesting the chat.

`Cursor.tsx` and `Preloader.tsx` both **decline to render at all** under
reduced motion — not "faster", not "simpler". The cursor also requires a fine
pointer, and only hides the native cursor once its replacement is on screen, so
touch and pre-hydration visitors are never left without one. The preloader is
capped at 1.5s, runs once per session (`sessionStorage`), and never blocks on
the network — it is choreography, not a loading bar.

## The coin

`components/seal/SealCanvas.tsx` draws the hero disc through
`lib/design/guilloche.ts`. `drawSeal`'s `reveal` option (0–1) clips the whole
render to a wedge sweeping from twelve o'clock, so plate, engraving and rim
arrive as one impression — revealing them separately looks like three
animations instead of one strike.

In the hero the coin sits **behind** the headline. It was stacked above it
first, and the disc alone filled the entire first screen and pushed the
sentence below the fold. Struck currency carries engraving and lettering on the
same face; keep it that way.

## Pinning — the rule that cost a hotfix

`Worlds` is the only pinned section. ScrollTrigger reserves a pin's scroll
distance by wrapping the pinned element in a generated `.pin-spacer` and
padding it out — about 1,800px here. Two things follow, and breaking either
one produces the same bug: the next section arrives early and the pinned panel
hangs over it.

1. **No ancestor of the pinned element may have a fixed height or clip it.**
   The section carried `lg:h-screen` + `overflow-hidden`, which capped the
   spacer at 900px and threw the rest away. Viewport height belongs on the
   pinned child, not on the section.
2. **The pinned element needs its own opaque background.** It is
   `position: fixed` for the whole pin while the section's background scrolls
   away beneath it, so a transparent panel composites over whatever follows
   instead of hiding it.

Stacking order lives in the `z` object in `lib/design/tokens.ts`, mirrored to
`--z-*` and Tailwind (`z-nav`, `z-pinned`, `z-sticky`…). Never write a bare
`z-30`.

## The Agency dashboard

`/agency` renders every agent in https://github.com/msitarzewski/agency-agents
(MIT): 18 divisions, four runbook teams, one plate per agent, a detail panel,
and a "Mint this agent" action that hands the agent's description to the
existing `/create` flow through the same `sessionStorage` key the hero uses.

The data is a generated file, `lib/agency/agents.json`. **Never edit it by
hand.** Refresh it with

    npm run sync:agency                       # shallow-clones upstream itself
    npm run sync:agency -- --source ../path   # or point it at a checkout

The script (`scripts/sync-agency.mjs`) reads upstream's `divisions.json`, every
agent's YAML frontmatter and `##` headings, and `strategy/runbooks.json`, then
writes one JSON with a `meta` block recording the upstream commit. It parses
the frontmatter the way upstream's own `scripts/lib.sh` does — quoted scalars
unquoted, indented continuation lines folded — and treats the clone as text
only. Commit the regenerated JSON with the sync.

Two upstream fields are carried but never rendered: `emoji` (banned on sight)
and `color` (only `tokens.ts` may name a colour). The dashboard's marks are
procedural instead — `AgencyMark` engraves each agent's initials into one of
the six existing cartouches, mapped by division.

The detail panel does not lock page scroll. It stops wheel events at the
overlay so Lenis never sees them, and carries `data-lenis-prevent`; that is
what keeps a scroll over the panel from moving the page. Re-test it in the
playground's spirit if `SmoothScroll.tsx` changes.

## Testing

`npm run test:scroll` (`app/test/scroll-integrity.mjs`) sweeps the homepage top
to bottom at 1440×900 and 390×844, in normal and reduced motion, and fails if
any headline or card from one section overlaps one from another. **Run it after
any change to layout, type scale, or motion** — this class of bug is invisible
to the build, to `tsc`, and to any single screenshot, because it only exists
mid-scroll.

It resolves Playwright at run time instead of declaring it, so it adds nothing
to the install; set `PLAYWRIGHT_MODULE` if it isn't resolvable. Making it run
in CI would mean adding `playwright` as a devDependency.

## Cost and abuse

There are no user accounts, so anyone on the internet can trigger a paid
Anthropic call. Everything that spends credits goes through `guardAI()`.

- Kill switch: set `AI_DISABLED=true` in the Vercel dashboard. Stops all spend.
- `/api/status` reports `engine`, `paused`, and `limiter` — check it after deploys.
- `limiter: "memory"` means Upstash is not configured, so per-IP limits are
  best-effort per serverless instance. Setting `UPSTASH_REDIS_REST_URL` and
  `UPSTASH_REDIS_REST_TOKEN` in Vercel switches it to `redis` and makes them real.
  **This is still outstanding.**
- Model is `claude-haiku-4-5` by default; override with `AGENTMINT_MODEL`.

## Deploys

`.github/workflows/deploy-vercel.yml` fires on pushes to
`claude/ai-agency-planning-07d0h3` that touch `app/**`. Credentials come from
GitHub Actions secrets and nowhere else — never from issues, files, workflow
inputs, or `$GITHUB_ENV`.

## Known gaps

- Upstash env vars unset in Vercel, so `limiter` is `memory` (see above).
- The Anthropic API key should be rotated; it was passed through chat earlier.
- Agents live in the creator's browser `localStorage`. A different browser shows
  "Agent not found". Accounts and a database are a later phase.
- The founder film's own opening frame is stock-style AI artwork that the
  current direction rules out, so `FounderFilm.tsx` covers it with an engraved
  plate until play. A real poster frame from further into the film still needs
  picking by hand.

## House rules

- `lib/design/tokens.ts` and the `:root` block in `globals.css` mirror each
  other. Change both or neither.
- No component names a raw colour. Rebranding must stay a two-file change.
- Never print or commit a secret value.
- When testing a production build locally, confirm the running server's asset
  hashes match what is on disk before trusting a result. A stale `next start`
  serves an old build's HTML against a new build's chunks, which shows up as
  400s and `ChunkLoadError` and looks exactly like a real regression.
