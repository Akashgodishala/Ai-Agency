# 04 — Tech Stack & Costs

> **In one line:** AgentMint is built on boring, popular, mostly-free
> technology, plus one paid ingredient — the AI itself — whose cost is roughly
> a penny per chat message and fully under our control.

This document explains what the platform is built with (and why those choices
are good ones), what running it will realistically cost at 0, 100, and 1,000
users, and exactly which accounts you'll need to create along the way.

A rule we follow throughout: **costs here are honest estimates, not promises.**
Where a number depends on an assumption, the assumption is written down next
to it.

---

## 1. What it's built with, and why

You don't need to learn these tools — Claude does the engineering. But you
should recognize the names, because they'll appear in conversations, bills,
and account sign-ups.

| Ingredient | What it is | Why this choice |
|-----------|------------|-----------------|
| **Next.js** | The framework the whole web app is built in — pages, buttons, and the small backend that talks to the AI, all in one project | The most popular tool of its kind. Huge community, easy to hire for or get AI help with, and it deploys almost anywhere in minutes |
| **TypeScript** | The programming language (JavaScript with built-in error-checking) | Catches whole categories of bugs before the app even runs — important when one person (you) is the entire QA department |
| **Tailwind** | The styling toolkit that makes the app look good | Fast to change, consistent by default |
| **Claude (Anthropic)** | The AI model that powers the live product — building agents, chatting, refining | Strong at following instructions and staying inside guardrails, which is exactly what "answer only from the owner's knowledge" requires. The app currently uses the **Sonnet** model tier — the sweet spot of quality and price — and switching models later is a one-line change |
| **The demo engine** | Our own hand-written fallback brain (see [doc 03](03-how-the-platform-works.md)) | Lets us build, test, and demo the entire product at $0 |
| **Browser storage** (today) | Agents and inboxes are saved in each visitor's own browser | Free, private, zero setup — right for the playground phase |
| **A database** (phase ②) | A secure filing cabinet on a server — likely Supabase or Neon, both with generous free tiers | Needed the moment accounts and share links exist |
| **Vercel** (phase ②) | Hosting — the service that keeps the website running on the public internet | Made by the Next.js team, so deployment is nearly automatic. Free to start |
| **Stripe** (phase ③) | Payment processing for the paid plans | The industry default. No monthly fee — it takes a small cut of each transaction |

The theme across every row: **popular and boring beats clever and exotic.**
Popular tools have free tiers, endless documentation, and thousands of people
who can help — including AI assistants, which are best at exactly the tools
they've seen the most of.

---

## 2. What the AI actually costs

This is the one genuinely new kind of bill in this business, so it's worth
understanding properly.

**How AI billing works:** Anthropic charges by the amount of text processed,
measured in "tokens" (a token is roughly three-quarters of a word). You pay a
tiny rate for text sent *in* (the agent's instructions, its knowledge, the
conversation so far) and a somewhat higher rate for text coming *out* (the
reply). There's no monthly minimum — a month with no usage costs $0.

**What one chat message costs on AgentMint,** with the model we currently use
(Claude Sonnet, about $3 per million tokens in / $15 per million out):

| Piece | Rough size | Rough cost |
|-------|-----------|-----------|
| Instructions + knowledge + conversation sent in | ~2,000 tokens | ~$0.006 |
| The agent's reply (we cap it at short replies) | ~300 tokens | ~$0.005 |
| **Total per message** | | **~1 cent, often less** |

Creating an agent in the factory, or applying a refine instruction, costs
about the same — one to two cents each.

Three things keep this number under control as we grow:

1. **Message caps.** The free tier includes a limited number of messages —
   which keeps our cost per free user to around a dollar a month at worst,
   less in practice. Paid plans have higher caps that still leave healthy margin under
   the ~$19 and ~$49 price points. The caps aren't stinginess; they're the
   cost thermostat of the whole business.
2. **Caching.** Anthropic charges ~90% less for text it has seen very
   recently. An agent's instructions and knowledge repeat on every message of
   a conversation, so long chats get cheaper per message. We'll switch this on
   as part of phase ② polish.
3. **Model choice.** If costs ever bite, we can move everyday chat to a
   smaller, cheaper model (about a third of the price) while keeping the
   smarter one for building agents. It's a one-line change.

One honest caveat: AI prices change — historically they've mostly gone
*down*, but always check the current numbers at
[anthropic.com/pricing](https://www.anthropic.com/pricing) before making
decisions that depend on them.

---

## 3. Monthly costs at 0 / 100 / 1,000 users

Three snapshots of the whole bill. "Users" here means people who actively use
the product in a month — and note that costs follow *usage*, not sign-up
count: a thousand curious one-time visitors cost almost nothing; a hundred
heavy daily users cost more.

### Today: 0 users (building and testing)

| Item | Monthly cost | Notes |
|------|-------------|-------|
| Hosting | $0 | Runs on your computer, or Vercel's free tier |
| Database | $0 | Doesn't exist yet — browser storage is free |
| AI | $0 required | Demo engine is free. With a live API key, your own testing might run **$2–$10/month** |
| Domain name | ~$1–2/month (~$10–20/year; budget ~$12) | Optional until you've picked the real name |
| **Total** | **$0–$15** | |

### 100 active users (early traction, mostly free tier)

Assumptions: nearly everyone is on the free tier; the average user sends
20–60 messages a month; a handful max out their cap.

| Item | Monthly cost | Notes |
|------|-------------|-------|
| AI | $15–$100 | The big variable. Worst case if all 100 users maxed a 100-message cap: ~$100 |
| Hosting (Vercel) | $0–$20 | Free tier likely still fine; $20 if we outgrow it |
| Database | $0–$25 | Free tiers are generous at this size |
| Domain + email | ~$2 | |
| **Total** | **~$20–$150** | |

At this stage the platform is a hobby-sized expense — less than most phone
bills — while we learn whether people love it.

### 1,000 active users (the "is this a real business?" test)

Assumptions: same usage pattern, 10× the people; 3–5% have upgraded to paid
plans (that conversion rate is a guess we'll be testing, not a fact).

| Item | Monthly cost | Notes |
|------|-------------|-------|
| AI | $150–$800 | Caching and caps keep the top of this range down |
| Hosting (Vercel Pro) | $20–$100 | |
| Database (paid tier) | $25–$50 | |
| Email service, misc tools | $10–$30 | Password-reset emails, lead notifications |
| Stripe fees | ~3% of revenue | Only exists when revenue exists |
| **Total** | **~$200–$1,000** | |

**And the other side of the ledger:** at 1,000 users, if 3–5% pay an average
of ~$25/month (a mix of Pro and Business), that's **$750–$1,250/month of
revenue** — roughly break-even to modestly profitable on the numbers above.
That's the milestone this phase exists to prove or disprove. If conversion
lands lower, the levers are the free-tier cap, pricing, and AI cost per
message — all of which we control.

**What's deliberately *not* in these tables:** your time, and engineering.
Claude does the engineering as part of how you already work; there's no
contractor line item. The main hidden cost of this business is founder
attention, not software.

---

## 4. Accounts you'll need to create, and when

Each of these takes minutes to set up. None require technical skill — they're
all "sign up, verify email, add a payment card" flows. Create them when the
phase demands it, not before.

| Account | What it's for | When to create it | Cost |
|---------|--------------|-------------------|------|
| **Anthropic** ([console.anthropic.com](https://console.anthropic.com)) | The API key that switches the app from demo engine to live AI | **Now** — it's the current top item on the roadmap | Pay-per-use (section 2). Add $5–$10 of credit to start |
| **GitHub** | Where the code lives, safely versioned and backed up | Now, if not already set up | Free |
| **Domain registrar** (e.g. Namecheap, Cloudflare) | The real name's web address | Phase ② — as soon as you've picked the name | ~$10–20/year (budget ~$12) |
| **Vercel** | Hosting the live website | Phase ② — when we publish share links | Free tier, then $20/month |
| **Database provider** (e.g. Supabase or Neon) | Accounts, saved agents, inboxes | Phase ② — same moment as hosting | Free tier, then ~$25/month |
| **Stripe** | Taking payments for Pro and Business plans | Phase ③ — when billing is built | No monthly fee; ~2.9% + 30¢ per transaction |
| **Email sending service** (e.g. Resend) | Password resets, "you got a new lead" notifications | Phase ③, possibly late phase ② | Free tier to start |

Two habits that will save you real pain:

- **Use one dedicated email address for all of these** so nothing gets lost in
  a personal inbox.
- **Treat the Anthropic API key like a bank card number.** Anyone who has it
  can spend on your account. It lives only in the app's private settings file
  (never in the code, never in a chat or screenshot), and Anthropic's console
  lets you set a monthly spending limit — do that on day one.

---

## 5. The honest summary

- The technology is standard and cheap. Nothing here is exotic, and nothing
  locks us in.
- The only meaningfully variable cost is the AI, and it's both small (a penny
  a message) and controllable (caps, caching, model choice).
- Running costs stay under ~$150/month until we have real traction, and the
  business math at 1,000 users is plausible — which is exactly what phases ②
  and ③ are designed to test.

---

*Next: the phases from here to launch, and how we decide to move between
them → [05 — Roadmap](05-roadmap.md)*
