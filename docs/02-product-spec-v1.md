# 02 — Product Spec, Version 1

> **In one line:** v1 lets anyone describe an agent (or grab one from the
> gallery), get it built in about a minute, chat with it, refine it in plain
> English, and see the leads it captures — all inside the app.

This spec describes what is **actually built and running** in the
[`app/`](../app/) folder today — screen by screen — plus what a v1 agent can
and can't do, and what we deliberately left out. If this doc and the app ever
disagree, the app is being updated and this doc should catch up.

For *why* we're building this, see
[01 — Vision & Strategy](01-vision-and-strategy.md). For how the machinery
works under the hood, see
[03 — How the Platform Works](03-how-the-platform-works.md).

---

## 1. The two ways in

Every user takes one of two paths to a working agent:

**Path A — Describe it (the "magic box"):**

> Landing page → type a description → a few follow-up questions + "what should
> it know?" → the factory builds it → playground.

**Path B — Grab it (the gallery):**

> Landing page → click a ready-made agent card → **Get this agent** → it's
> yours to test → playground. (Then make it your own: paste your info, refine
> its personality — and buy it once you're convinced, when checkout ships in
> the billing phase.)

Path B has zero questions and zero waiting — one click to a working agent.
Path A takes about a minute. Both end in the same playground.

---

## 2. What an agent is, in v1

Under the hood, an agent is a small recipe card (developers call it the
"config"). Everything the product does is reading or rewriting this card:

| Part | What it is | Example |
|---|---|---|
| Name + emoji + tagline | How the agent appears on cards and in chat | 📞 "AI Front Desk — answers customer questions 24/7" |
| Persona | Its job description, personality, and manner | "Warm, professional front-desk assistant; keeps replies short…" |
| Greeting | The first message it sends | "Hi! Welcome — I can answer questions about our services…" |
| Suggested questions | Tap-to-ask chips shown at the start of a chat | "What are your hours?" |
| Knowledge | The owner's pasted text (and/or text read from a web page) — the agent's source of truth | Hours, prices, policies, notes |
| Guardrails | Hard rules it must never break | "Never invent prices. Never give medical advice." |
| Capture rules | Whether/when/what to collect from visitors | Ask for name + email when someone wants a callback |

Two things this design guarantees:

- **The agent answers from the owner's knowledge, not from imagination.**
  Guardrails tell it to admit gaps and offer to take a message instead of
  guessing.
- **Refining is just rewriting the card.** "Be more formal" edits the persona;
  "never discuss prices" adds a guardrail. That's why plain English is the
  whole settings panel.

---

## 3. Screen by screen

### 3.1 Landing page (`/`)

The homepage makes the whole pitch in one screen:

- **Headline:** "Describe it. Mint it. Use it." with the tagline "Your own AI
  agent · no coding · minutes."
- **The magic box:** a big text area — "What should your agent do?" — with a
  **Mint my agent →** button. Enter submits; Shift+Enter makes a new line.
  Below it, four tappable example descriptions (bakery assistant, study
  buddy, Japan trip planner, Etsy gift helper) that fill the box with one
  click, so a hesitant visitor never faces a blank page.
- **How it works:** three short steps — Describe, Mint, Use. (Step 3 says
  honestly that publishing to a link & widget is *coming next*, not here yet.)
- **The gallery:** 50 flagship agent cards across six categories, each card
  with an emoji, an audience tag, a one-line tagline, and a **Get this
  agent →** action. Getting an agent instantly creates your own copy and
  opens it in the playground — no questions asked. The flow is try-first by
  design: create or grab an agent, **test it in the playground**, buy it when
  convinced. The "Get this agent" step exists in the UI today; real checkout
  arrives in the billing phase (phase ③ — it needs the founder's Stripe
  account), so for now the step simply hands you the agent to test.

The six categories: **Money & Finance** (13 agents — e.g. AI Expense Tracker,
AI Invoice Chaser), **Home & Real Estate** (5 — e.g. AI Listing Writer),
**Work & Documents** (10 — e.g. AI Contract Reviewer, AI Meeting Summarizer),
**Marketing & Growth** (12 — e.g. AI Cold Email Writer, AI Social Caption
Writer), **Commerce & Retail** (7 — e.g. AI Gift Recommender, AI Product
Description Writer), and **Career & Life** (3 — e.g. AI Resume Tailor, AI
Interview Coach). All 50 work within v1's abilities (section 4) — they chat
from the knowledge you give them and capture leads — just aimed at fifty
different jobs.

### 3.2 Follow-up questions (`/create`)

After submitting a description, the user lands here. The page:

- **Shows their description back to them** ("Your agent: …") so they know
  they were heard.
- **Asks two or three quick follow-up questions**, generated from their
  description (e.g. for a bakery: "What's the business called?", "What are
  your hours?"). **Every question is optional** — the placeholder text says
  "skip anything you're unsure about." Nobody gets stuck at a form.
- **Asks "What should it know?"** — one box to paste anything useful (FAQs,
  prices, notes, policies) and one optional field for a public web page
  address the factory will read. Both optional too.
- **Shows a demo notice when no AI key is connected:** a small banner
  explains that a simplified demo engine will build and run the agent, that
  everything still works, and that connecting a key makes it fully
  intelligent. Honesty is a feature — see
  [doc 03](03-how-the-platform-works.md) for demo vs. live.
- **Build my agent →** shows a "Minting your agent…" spinner, then opens the
  playground. If anything fails, a friendly error appears and **the user's
  answers are preserved** so they can just try again.

### 3.3 The factory (behind the scenes)

Not a screen — the machinery the create page talks to. It does two jobs:
first call, it reads the description and returns the follow-up questions;
second call, it takes description + answers + knowledge and returns the
finished agent card (section 2). With an AI key, Claude does the reading and
writing; without one, a simpler built-in engine matches the description
against the gallery templates and customizes from there. Full plain-English
tour in [doc 03](03-how-the-platform-works.md).

### 3.4 The playground (`/playground/<agent-id>`)

Where an agent lives. One screen, two columns.

**Left — the chat:**

- Header with the agent's emoji, name, and tagline, plus an **engine badge**:
  a green **live AI** badge when a key is connected, an amber **demo** badge
  otherwise. The user always knows what's answering them.
- The conversation starts with the agent's greeting. Before the first
  message, the agent's **suggested questions** appear as tappable chips.
- Typing indicator (animated dots) while the agent thinks; friendly
  "connection hiccup — try that again" message if the network fails.

**Right — the side panel, three cards:**

1. **Refine your agent.** One input: "Tell it how to change, in plain
   English — 'be more formal', 'never discuss prices', 'call it Sunny'."
   Apply, and the agent's card is rewritten; a short confirmation says what
   changed (e.g. "Made the tone more formal"). The change sticks — it's
   saved, not just for this chat.
2. **Inbox.** Every lead or message the agent captures shows up here as a
   short summary plus details, with a count badge. If the inbox is empty, a
   hint explains what will appear (and suggests trying to share an email
   address in chat). If this agent has capturing turned off, it says so —
   and points out you can enable it via Refine.
3. **Publish.** Honest placeholder: "A shareable link and website widget for
   this agent are **coming in the next phase**. For now it lives here in
   your playground." Two working buttons: **Export config** (downloads the
   agent's recipe card as a file — a portable backup) and **Delete agent**
   (with an are-you-sure check).

### 3.5 My agents (`/agents`)

The shelf of everything you've minted in this browser:

- A card per agent (emoji, name, tagline) linking to its playground, with an
  "N in inbox" badge when it has captured leads.
- A friendly empty state — "No agents yet… Mint your first agent →" — when
  there's nothing.
- An honest caption: agents you've minted **in this browser** — accounts
  that sync across devices arrive with the publish phase.

---

## 4. What a v1 agent can and can't do

**Can:**

- Hold a natural conversation in its persona, in the owner's chosen tone.
- Answer questions from the owner's provided knowledge — pasted text and/or
  one public web page.
- Admit what it doesn't know, and offer to take a message instead of
  inventing an answer.
- Capture leads/messages (per its capture rules) into the inbox: who, how to
  reach them, what they wanted.
- Be reshaped at any time through plain-English refinement.

**Can't (yet — see section 6):**

- Be shared with anyone else, or live on a website.
- Take actions: no booking, no sending emails, no buying, no browsing.
- Read uploaded files (PDFs, docs) — v1 knowledge is pasted text or a web
  page.
- Remember conversations after the tab closes (each playground visit starts
  a fresh chat; captured leads *are* kept).

---

## 5. Where things are saved (v1 honesty)

In v1, agents and their inbox live **in the browser they were created in**
(browser storage on the user's own device — nothing is stored on our
servers). Messages pass through our server briefly to get an answer, but
nothing is saved there — agents and inboxes are stored only in your browser.
That's the right cheap-and-cheerful choice for a playground phase,
and it has consequences worth stating plainly:

- Open the site on another device (or another browser) and your agents
  aren't there.
- Clearing the browser's site data deletes your agents and inbox. **Export
  config** in the playground is the backup button.
- Nobody else can talk to your agent yet — so in practice, v1 inbox entries
  come from your own test chats. Real strangers reach your agent in phase ②,
  when it gets a link and a real database behind it.

The code is deliberately structured so that swapping this for a real
database (phase ②) won't change how any screen works.

---

## 6. Deliberately NOT in v1

Every one of these is a decision, not an oversight. Small-and-working beats
big-and-broken.

| Not in v1 | Why we waited | When it's planned |
|---|---|---|
| Accounts / login | Nothing to protect until agents are shareable | Phase ② |
| Shareable link + website widget | Needs accounts and a real database first | Phase ② |
| Real database (agents on our servers) | Browser storage is enough for a private playground | Phase ② |
| Payments / subscriptions | Charging comes after publishing proves value | Phase ③ |
| WhatsApp, email, other channels | Each channel is real work; the widget must earn it first | Phase ④ |
| Agents that take actions (booking, sending email) | Actions raise the stakes — trust and safety first | Phase ④ |
| File uploads (PDFs, docs) as knowledge | Paste + one web page covers most v1 cases | Later, by demand |
| Reading a whole website (many pages) | v1 reads one page well rather than many badly | Later, by demand |
| Analytics / conversation history for owners | Needs the database; matters once strangers chat | Phase ② or later |
| Template marketplace (users selling agents) | Needs a thriving user base to stock it | Phase ④ |

The full sequencing logic — and the definition of done that gates each
phase — is in the [Roadmap](05-roadmap.md).

---

## 7. How we judge v1

v1 succeeds if a first-time visitor — with no explanation from us — can go
from the landing page to *chatting with an agent that sounds like what they
asked for* in under three minutes, and can then change something about it
using the Refine box. That's the test to run on real people, starting with
the founder as customer zero — the how-to is in the
[Founder Guide](06-founder-guide.md).

---

**Next:** the five parts of the machine, in plain English →
[03 — How the Platform Works](03-how-the-platform-works.md)
