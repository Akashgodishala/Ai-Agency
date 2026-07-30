# AgentMint — working state

Describe the work in plain English, mint a working AI agent, test it free, then
subscribe. Live at https://agentmint-olive.vercel.app.

This file is the running record of where the build is. Read it first.

## Where things stand

| Round / Phase | Status | What it was |
| --- | --- | --- |
| **Round 0 — safe to go public** | **CLOSED** | Credit-drain hardening, workflow credential hardening, full git-history secret audit. Verdict reached: `GREEN AND SAFE TO FLIP PUBLIC`. |
| **Phase A — motion foundation** | **DONE** | Lenis smooth scroll wired to GSAP ScrollTrigger, one central motion module, reduced motion respected globally. |
| **Phase B — hero decision** | **NEXT** | Decide what the hero is. Not started. |

## Layout

    app/                      the Next.js 14 App Router application
      app/                    routes: /, /agents, /create, /playground/[id], /api/*
      components/motion/      gsap.ts, SmoothScroll.tsx, MaskedLines.tsx
      components/site/        page sections
      components/chat/        the playground transcript
      lib/design/tokens.ts    THE source of truth for colour, type, motion
      lib/ratelimit.ts        durable per-IP + global limits
      lib/ai-guard.ts         the single gate in front of every paid call
    docs/                     vision, spec, roadmap, founder guide
    archive/                  superseded material

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

## House rules

- `lib/design/tokens.ts` and the `:root` block in `globals.css` mirror each
  other. Change both or neither.
- No component names a raw colour. Rebranding must stay a one-file change.
- Never print or commit a secret value.
