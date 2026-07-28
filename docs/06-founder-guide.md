# 06 — Founder Guide

> **In one line:** you make the decisions and test the product like its first
> customer; Claude does all the engineering — and this doc is the manual for
> that partnership, plus the accounts you'll need and a glossary for the
> terms you'll meet most often.

This is the doc to come back to whenever you're unsure *what to do next* or
*how to ask for it*. The what-and-why of the product is in
[01 — Vision & Strategy](01-vision-and-strategy.md); what exists today is in
[02 — Product Spec v1](02-product-spec-v1.md).

---

## 1. Who does what

The division of labor is simple and worth protecting:

| | **You (the founder)** | **Claude** |
|---|---|---|
| Product | Decide what it should do and feel like; say yes/no to trade-offs | Propose options with honest trade-offs; build what's decided |
| Engineering | Nothing — genuinely nothing | Everything: code, fixes, database, publishing, billing plumbing |
| Testing | Be customer zero (section 3) — your fresh eyes are irreplaceable | Test technically; can't ever be a *first-time user*, which is why you matter |
| Naming & brand | Pick the real name (AgentMint is a placeholder), the domain, the look you want | Rename it everywhere in one go once you decide; draft options if helpful |
| Accounts & money | Create the accounts (section 4), hold the passwords and payment details | Tell you exactly which account is needed, when, and why — never asks for passwords |
| Marketing (phase ③+) | The channels, the pitch, talking to users | Draft copy, landing pages, launch materials |
| Deciding to advance a phase | The final call, out loud | Lay out the evidence and a recommendation ([how phases gate](05-roadmap.md)) |

Two habits that keep this working:

- **You never need to understand the code.** If an explanation from Claude
  contains a word you don't know, say so — a plain-English version is part of
  the job, not a favor.
- **Claude brings decisions to you; you don't have to spot them.** Anything
  that affects cost, what users see, or what the product promises gets
  surfaced as a question, not buried in a change.

---

## 2. How to ask for changes

There's no special format. Plain sentences work — that's the whole point of
the product, and it's how building it works too. A few patterns make requests
land faster:

**Describe the outcome, not the implementation.**

> ✅ "When someone's agent has no knowledge yet, nudge them to add some."
> ❌ "Add a conditional banner component to the playground header."

The second one is fine if you happen to think that way — but you never have
to. Say what you want a user to experience; how is Claude's problem.

**For bugs, give the three facts:** what you did, what you expected, what
actually happened.

> "I grabbed the AI Gift Recommender, asked about shipping, and expected an
> answer from its knowledge — instead it said it didn't know."

A screenshot helps when something *looks* wrong. Also say whether the badge
read **demo** or **live AI** — behavior differs between them, honestly and by
design (see [doc 03](03-how-the-platform-works.md)).

**Vibes are valid requests.** "The landing page feels cluttered" or "the
gallery cards feel samey" is actionable — expect a couple of options back
rather than one silent guess.

**One thing at a time for big changes.** A list of ten small fixes is fine in
one message. "Redesign the playground *and* add accounts *and*…" goes better
as separate conversations, so each gets decided and tested properly.

**It's cheap to be wrong.** Everything is undoable — the project's history is
saved at every step (that's the *repo*, see the glossary). "Try it, and if I
hate it we put it back" is a perfectly good instruction.

---

## 3. How to test like customer zero

You are the first user of every phase, and your job is to be *ruthlessly
ordinary*: no insider knowledge, no forgiveness. Before each phase advances,
run this ritual — it's also the sign-off the [roadmap](05-roadmap.md)
requires.

**The ritual:**

1. **Get fresh eyes.** Open a private/incognito browser window. This makes
   the site forget your previous agents, so you experience it exactly as a
   stranger would.
2. **Run the three-minute test.** From the landing page, describe an agent a
   real person might want (use your own life: a hobby, a side hustle, a trip).
   Can you get to *chatting with an agent that sounds like what you asked
   for* in under three minutes, with nobody explaining anything?
3. **Take the other path too.** Grab a gallery agent with one click. Does it
   feel instantly yours?
4. **Try to break it, politely.** Ask the agent about a price or service that
   *isn't* in its knowledge. The right behavior is admitting it doesn't know
   and offering to take your details — not inventing an answer. An agent that
   makes things up is a bug; report it like one.
5. **Feed the inbox.** In chat, ask for a callback and leave a name and
   email. Then check the playground's Inbox panel — your details should be
   there, summarized.
6. **Refine something.** "Be more formal." "Call yourself Sunny." "Never
   discuss prices." Did it change — and did the confirmation say what changed?
7. **Write down every stumble** — every moment of "wait, what do I do here?",
   however small. First-time confusion is the one thing Claude cannot feel
   and you can only feel *once* per screen. Report stumbles with the three
   facts from section 2.

**The pass bar,** borrowed from the [roadmap](05-roadmap.md): you'd show
it to a friend without apologizing for anything. Later phases extend the
ritual (phase ②: publish an agent, open its link on your phone, leave
yourself a lead; phase ③: pay yourself for a Pro plan with a real card and
then cancel it).

One honesty note: in v1 your agents live in the browser you made them in, so
the incognito window starting empty is expected, not a bug
([doc 02, section 5](02-product-spec-v1.md)).

---

## 4. The accounts checklist

Every account is created *by you*, owned *by you*, paid for *by you* — Claude
tells you when each is needed and what to do inside it, but never holds your
passwords. Costs below are rough one-liners; the real numbers at 0 / 100 /
1,000 users are in [doc 04](04-tech-stack-and-costs.md).

| Account | What it's for | When you need it | Rough cost |
|---|---|---|---|
| **Anthropic** (console.anthropic.com) | The API key that switches the app from demo engine to live AI | **Now** — it's the open box on phase ① | Pay-as-you-go; pennies per conversation at first |
| **GitHub** | Where the project's code and history (the repo) live | Now, if not already set up | Free |
| **Hosting** (likely Vercel — the natural home for a Next.js app) | Puts the app on the public internet | Phase ② | Free tier to start |
| **Domain name** (any registrar) | Your real web address — which means picking the real *name* first, and that's your decision | Phase ② | ~$10–20/year (budget ~$12) |
| **Database service** | Where agents, accounts, and inboxes live once they leave the browser; Claude will recommend one when phase ② starts (candidates in [doc 04](04-tech-stack-and-costs.md)) | Phase ② | Free tier to start |
| **Stripe** | Takes card payments for Pro/Business plans | Phase ③ | No monthly fee; roughly 3% + a few cents per transaction |
| **Email sending service** (e.g. Resend) | Password resets, "you got a new lead" notifications | Phase ③, possibly late phase ② | Free tier to start |

When a phase needs an account, the flow is always the same: Claude says
"time to create X, here's why, here's the walkthrough" → you create it and
set up billing → you paste in whatever key or setting Claude asks for (never
a password). Keys are secrets — treat an API key like a bank card number:
don't share it, don't post it, and know it can be cancelled and replaced in
one click if it ever leaks.

---

## 5. A small glossary

The terms you'll meet most often, in plain English. (Tool names — Next.js,
Vercel, Supabase and friends — are explained where they're chosen, in
[doc 04](04-tech-stack-and-costs.md).) If you meet a word that isn't here,
ask — and it gets added.

| Term | Plain English |
|---|---|
| **Agent** | An AI assistant with a job: a personality, a greeting, rules, and knowledge to answer from. The thing this platform makes. |
| **Config** (the agent's "recipe card") | The small saved card describing an agent — name, personality, rules, knowledge. Refining an agent just rewrites this card. |
| **API key** | A long secret code that lets our app use Anthropic's AI, billed to your account. Like a bank card number for AI: keep it private, cancel-and-replace if leaked. |
| **Demo engine vs. live AI** | With no API key, a simpler built-in engine runs everything, honestly badged "demo." Add the key and real AI takes over. Full story in [doc 03](03-how-the-platform-works.md). |
| **Playground** | The screen where an agent lives: chat on the left; Refine, Inbox, and Publish panels on the right. |
| **Inbox** | Where an agent's captured leads and messages land — who wrote, how to reach them, what they wanted. |
| **Template / gallery** | Ready-made agents (50 flagship agents across six categories) anyone can grab with one click and then make their own. |
| **Publish / share link / widget** | Phase ②: putting an agent on the internet. The *link* is a public page where anyone chats with it; the *widget* is a chat bubble embedded on the owner's own website. |
| **Browser storage** | Saving data inside your own browser on your own device. Where v1 agents live — which is why they don't follow you to another device yet. |
| **Database** | Storage on our servers instead of in your browser. Arrives in phase ② so agents sync across devices and strangers can reach them. |
| **Repo** (repository) | The project's home: all the code and docs, plus a full history of every change — which is why any change can be undone. Ours lives on GitHub. |
| **Deploy** | Pushing the latest version of the app onto the internet so real people get it. "Deployed" = live. |
| **Hosting** | The service that keeps the app running on the internet 24/7 (likely Vercel for us). |
| **Domain** | The web address people type, like `yourname.com`. Bought for a small yearly fee from a registrar. |
| **Stripe** | The standard service for taking card payments online. Handles the cards so we never touch card numbers ourselves. |
| **Next.js** | The framework (toolkit) the app is built with — a mainstream, well-supported choice. Why it was chosen: [doc 04](04-tech-stack-and-costs.md). |
| **Free tier** | The $0 version of a service (ours, or a service we use), with limits. Most of our tools cost nothing until we have real traffic. |
| **Token** | The unit AI usage is measured and billed in — roughly three-quarters of a word. What that means for our costs: [doc 04](04-tech-stack-and-costs.md). |
| **QA** | "Quality assurance" — testing the product to catch problems before users meet them. Claude does the technical QA; you're the customer-zero QA (section 3). |

---

## 6. If you only remember three things

1. **You can't break it.** Everything is undoable, questions are free, and
   "explain that again, simpler" is always a fair request.
2. **Your fresh eyes are the scarcest resource in the company.** Run the
   customer-zero ritual honestly at every phase; report every stumble.
3. **Say what you want in plain words.** It's how customers will use the
   product, and it's how you build it.

---

**Next:** back to the start — what we're building and why →
[01 — Vision & Strategy](01-vision-and-strategy.md)
