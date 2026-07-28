# 03 — How the Platform Works

> **In one line:** AgentMint is one machine with five parts — a storefront that
> welcomes people, a factory that builds their agent, a playground where they
> use it, a delivery layer that puts the agent where their audience is, and a
> back office that keeps track of everything.

This document explains each part in plain English, shows what happens when
someone actually uses the product, and demystifies the one technical switch
that matters: **demo engine vs. live AI**.

You don't need to read any code to follow this. Where a part is already built,
we say so; where it's a future phase, we say that too.

---

## The machine at a glance

```
 A visitor arrives
        │
        ▼
 ① STOREFRONT ──── "describe it" box + gallery of ready-made agents
        │
        ▼
 ② AGENT FACTORY ─ turns their description into a working agent
        │
        ▼
 ③ PLAYGROUND ──── chat with it, refine it, check the inbox
        │
        ▼
 ④ DELIVERY LAYER ─ where the agent meets the world (link, widget… later more)
        │
        ▼
 ⑤ BACK OFFICE ──── accounts, saved agents, limits, billing
```

| # | Part | What it does | Status |
|---|------|--------------|--------|
| 1 | Storefront | Gets a stranger from "curious" to "making an agent" in one step | Built |
| 2 | Agent factory | Turns a plain-English description into an agent | Built |
| 3 | Playground | Chat, plain-English refining, and the inbox | Built |
| 4 | Delivery layer | Puts the agent in front of the owner's audience | Playground only today; link + widget next |
| 5 | Back office | Accounts, storage, limits, billing | Minimal today; grows in phases ② and ③ |

---

## Part 1: The storefront

**What it is:** the landing page — the front door of the business.

It makes one promise ("Describe it. Mint it. Use it.") and offers two ways in:

- **The magic box.** A single text box: *"What should your agent do?"* The
  visitor types something like "answer questions about my pottery classes and
  collect sign-ups" and presses one button. No sign-up form, no pricing wall,
  no tour — the product itself is the pitch.
- **The gallery.** Fifty flagship agents across six categories, for people
  who'd rather start from a shelf than a blank box: Money & Finance (13 —
  e.g. AI Expense Tracker), Home & Real Estate (5 — e.g. AI Listing Writer),
  Work & Documents (10 — e.g. AI Contract Reviewer), Marketing & Growth (12 —
  e.g. AI Cold Email Writer), Commerce & Retail (7 — e.g. AI Gift
  Recommender), and Career & Life (3 — e.g. AI Resume Tailor). One click on
  **Get this agent** puts a fully working copy in your hands — then you make
  it yours by adding your own info and adjusting its personality. The flow is
  create or grab → **test it in the playground** → buy it when convinced;
  the "Get this agent" step exists in the UI today, and real checkout arrives
  in the billing phase. All fifty stay within what a v1 agent can do:
  chatting from provided knowledge and capturing leads.

**Why it's designed this way:** the fastest possible route from "I wonder if
this works" to "it's talking to me" is the whole strategy. Every extra screen
before that moment loses people.

---

## Part 2: The agent factory

**What it is:** the machinery that turns a sentence into an agent. This is the
heart of the product — the part we have to get right.

Here's what actually happens, step by step:

1. **You describe what you need** in the magic box.
2. **The factory generates two or three short follow-up questions tailored to
   your description** — for a bakery, things like "What's the business
   called?" and "What are your hours?". Plain questions, plain answers, every
   one optional.
3. **A separate "What should it know?" box lets you paste knowledge** — your
   hours, your menu, your class notes, your store's return policy — or point
   it at a web page.
4. **The factory writes the agent's "recipe card."** Every agent is really a
   structured recipe with these ingredients:

| Ingredient | What it is | Example |
|------------|-----------|---------|
| Name + emoji + tagline | How the agent presents itself | "AI Front Desk — answers customer questions 24/7" |
| Persona | Its job description and personality | "Warm, professional, keeps replies short…" |
| Greeting | The first thing it says | "Hi! I can answer questions about our services…" |
| Suggested questions | Tap-to-ask chips that start the conversation | "What are your hours?" |
| Knowledge | The owner's pasted info — the agent's only source of facts | "Hours: Mon–Fri 9–6. First visit $79." |
| Guardrails | Hard rules it must never break | "Never invent prices. Never give medical advice." |
| Capture rules | When and how to collect visitor contact details | "When someone wants a booking, ask for name + email" |

That recipe card is the real product. It's what the factory produces, what the
playground runs, and — in the next phase — what gets published behind a share
link. Everything else is scenery around it.

**Why the recipe matters:** because it's editable. When you later tell your
agent "be more formal" or "never discuss discounts," the platform is just
updating this recipe — no programming involved, ever.

---

## Part 3: The playground

**What it is:** the room where owners meet their new agent. It has three
tools:

- **Chat.** Talk to your agent exactly the way your customers or friends
  would. This is where you find out whether it's good — by using it.
- **Refine.** A second text box where you talk *about* the agent instead of
  *to* it. "Make it funnier." "Call it Ruby." "Never promise delivery dates."
  The platform applies the smallest change to the recipe that fulfills your
  instruction and tells you in one sentence what changed. This replaces what
  other tools do with settings pages and dropdown menus.
- **Inbox.** When the agent captures a lead — someone leaves an email or phone
  number wanting a booking, a quote, or a callback — it lands here, with a
  short summary of what they wanted. For a business owner, this inbox *is* the
  return on investment.

One design decision worth knowing about: **lead capture never depends on the
AI's mood.** The platform detects emails and phone numbers with plain,
predictable pattern-matching in both demo and live mode. Your inbox works the
same on a bad AI day as on a good one.

---

## Part 4: The delivery layer

**What it is:** the bridge between an agent and the people it's meant to
serve. An agent that only its owner can talk to is a toy; delivery is what
makes it a product.

This is deliberately the least-built part today, and it grows in stages:

| Stage | Where the agent lives | Status |
|-------|----------------------|--------|
| Now | The in-app playground (only the owner can chat with it) | Built |
| Next (phase ②) | A **shareable link** — send it to anyone, no account needed to chat | Not yet |
| Next (phase ②) | A **website widget** — a small chat bubble on the owner's own site | Not yet |
| Later (phase ④) | WhatsApp, email, and agents that *do* things (book appointments, send messages) | Not yet |

**Why links and widgets come first:** they're the smallest step that makes an
agent genuinely useful to someone other than its owner, and they work for
everyone — a job hunter can send their AI Resume Tailor to a friend the same
way a salon puts a widget on its booking page.

---

## Part 5: The back office

**What it is:** everything behind the curtain — who owns which agent, where
agents are stored, who's on which plan, and how much usage each account gets.

Where it stands, honestly:

- **Today:** there are no accounts yet. Your agents and your inbox are saved
  in **your own browser** — technically, a small storage area on your device
  called localStorage. That's perfect for the playground phase (nothing to
  sign up for, nothing to leak), but it has real limits: your agents don't
  follow you to another device, and clearing your browser data erases them.
- **Phase ②:** real accounts and a real **database** — a secure filing cabinet
  on a server, instead of each visitor's browser. This is also what makes
  share links possible: an agent has to live somewhere public-facing before
  strangers can talk to it. The code was deliberately written so this swap is
  invisible to the rest of the app.
- **Phase ③:** billing joins the back office — the free/Pro/Business plans,
  message limits per plan, and payment handling via Stripe.

---

## Demo engine vs. live AI — the one switch that matters

AgentMint has two brains, and a single setting decides which one is running.

| | Demo engine | Live AI |
|---|---|---|
| What powers it | Simple hand-written rules (keyword matching, looking up lines in your knowledge) | Claude, a leading AI model, via Anthropic's API |
| Building an agent | Matches your description to the closest gallery template | Designs a custom agent from your description and answers |
| Chatting | Answers only from lines in your pasted knowledge; says so when it can't | Converses naturally, still grounded in your knowledge |
| Refining | Understands a handful of common instructions ("be more formal", "rename it…") | Understands almost any plain-English instruction |
| Cost | Free — no AI account needed | Pennies per conversation (see [Tech Stack & Costs](04-tech-stack-and-costs.md)) |
| How you know which is running | The screen shows an amber **demo** badge | The screen shows a green **live AI** badge |

**How the switch works:** the app looks for one thing — an **API key** from
Anthropic (a long password-like code that lets our app use Claude and bills
usage to our account). No key → demo engine. Key present → live AI. That's
the entire mechanism; nothing else changes.

**Why the demo engine exists at all:**

1. **You can test the whole product for free**, end to end, before spending a
   cent — every screen, every flow, the gallery, the inbox.
2. **It's honest.** The badge means nobody ever mistakes canned answers for
   real AI. We'd rather show a clearly-labeled rehearsal than a fake
   performance.
3. **It's a safety net.** If the AI service ever has an outage, the product
   degrades to demo mode instead of falling over.

To be clear: **the demo engine is not the product.** The product is live AI.
The demo engine is the free, honest stand-in that lets us build and test
without burning money.

---

## Follow the message: one chat, start to finish

To make the five parts concrete, here's what happens in the couple of seconds
after a visitor asks a bakery's agent *"Do you make gluten-free cakes?"*:

1. The message travels from the chat window to our app's small backend (the
   part that runs on a server, not in the visitor's browser).
2. The backend picks a brain: live AI if the API key is set, demo engine
   otherwise.
3. The agent's **recipe card** — persona, guardrails, knowledge, capture
   rules — is assembled into instructions for that brain. This is why the
   agent stays in character and sticks to the owner's facts.
4. The brain writes a reply. If the knowledge doesn't cover gluten-free cakes,
   a well-built agent says so and offers to take the visitor's contact details
   instead of inventing an answer.
5. Separately, the platform checks the visitor's message for an email or phone
   number. If one appears and capture is enabled, a lead is saved to the
   owner's **inbox**.
6. The reply appears in the chat window.

Every future channel — the share link, the widget, one day WhatsApp — reuses
exactly this pipeline. The delivery layer changes where step 1 starts; steps
2–6 stay the same.

---

*Next: what all of this is built with, and what it costs to run →
[04 — Tech Stack & Costs](04-tech-stack-and-costs.md)*
