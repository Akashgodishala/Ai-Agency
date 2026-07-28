# 01 — Vision & Strategy

> **In one line:** AgentMint (working name — you'll pick the real one) is a
> self-serve platform where anyone describes what they need in plain words and
> gets their own working AI agent in minutes — no coding, no consultants.

This document answers: what are we building, who is it for, why is now the
right moment, how are we different, how does it make money, and what does the
honest climb to "world-class" look like.

---

## 1. What we're building

A website where getting your own AI agent works like this:

1. **Describe it.** Type what you need into one big box — "an agent for my
   bakery that answers questions and takes custom-cake requests" — or grab a
   ready-made agent from a gallery.
2. **Mint it.** Our "agent factory" builds the agent: its personality, its
   greeting, its rules, and what it knows (you paste your notes or point it at
   a web page).
3. **Use it.** Chat with it immediately in a playground. If it's not quite
   right, tell it how to change *in plain English* — "be more formal", "never
   discuss prices" — and it changes.
4. **Share it** (next phase). Put your agent behind a shareable link or embed
   it on your website, where it answers visitors' questions and captures their
   contact details into your inbox.
5. **Subscribe to keep it** (later phase). A free tier to start, paid plans
   when your agent is earning its keep.

Steps 1–3 are **already built and working** — that's the app in the
[`app/`](../app/) folder. Steps 4–5 are the next two phases of the
[roadmap](05-roadmap.md).

What a v1 agent can actually *do* is deliberately narrow and useful:

- **Answer questions** from the knowledge its owner gave it (pasted text or a
  web page) — and admit when it doesn't know, instead of making things up.
- **Capture leads and messages** into an inbox — names, emails, requests — so
  a business owner never misses an inquiry.

Everything else (WhatsApp, sending emails, booking appointments) comes later,
on purpose. A small thing that works beats a big thing that almost works.

---

## 2. Who it's for

**Anyone.** That sounds like a mistake — "pick a niche" is standard advice, and
our earlier services-era plan said exactly that (see
[what changed](#7-what-we-changed-and-why), below). But for a *self-serve
product*, "anyone" works differently than for an agency: we don't need to
personally sell to each customer, so we don't need to specialize our sales
pitch. We need the product to be simple enough that anyone can serve
themselves.

The gallery stocks **50 flagship agents across six categories**, showing the
spread we're aiming at:

| Category | Agents | A few examples |
|---|---|---|
| Money & Finance | 13 | AI Expense Tracker, AI Invoice Chaser, AI Budget Planner |
| Home & Real Estate | 5 | AI Listing Writer, AI Moving Checklist Helper |
| Work & Documents | 10 | AI Contract Reviewer, AI Meeting Summarizer |
| Marketing & Growth | 12 | AI Cold Email Writer, AI Social Caption Writer |
| Commerce & Retail | 7 | AI Gift Recommender, AI Product Description Writer |
| Career & Life | 3 | AI Resume Tailor, AI Interview Coach |

Notice the pattern: the mix spans **personal** helpers (free-tier territory —
they bring volume and word of mouth) and **business** workhorses (paid-tier
territory — an agent that captures leads is worth real money to a salon or an
online shop). The free personal users are our marketing; the business users
are our revenue. One product serves both because the underlying machine is
identical.

Two honest notes on the gallery. First, every one of the 50 works within what
a v1 agent can actually do (section 1): chat from the knowledge its owner
provides, and capture leads. The templates aim those two abilities at fifty
different jobs — nothing more is promised. Second, the flow we're building
toward is **create or grab an agent → test it in the playground on our site →
buy it when convinced**. The "Get this agent" step exists in the UI today;
real checkout arrives in the billing phase, because it needs the founder's
Stripe account ([roadmap](05-roadmap.md)).

---

## 3. Why now

Three things became true recently, and the overlap is our opening:

1. **AI got good enough to hold a real conversation.** A well-instructed AI
   agent can now answer questions from provided knowledge accurately, stay in
   character, and know when to say "let me take your details." Two years ago
   this was flaky; now it's dependable.
2. **Everyone knows what AI chat is — but almost nobody has *their own*.**
   ChatGPT taught the world to talk to AI. The obvious next want is "one of
   those, but it knows *my* stuff, wears *my* name, and works for *me* (or my
   customers)." That want is mainstream now, and mostly unserved at
   consumer-grade simplicity.
3. **AI can now build the agent, not just be the agent.** This is our quiet
   trick. The "agent factory" uses AI to read your plain-English description
   and *generate the whole agent* — its personality, rules, greeting, and
   capture behavior. That's what makes "describe it and get it in minutes"
   possible without a human in the loop. It's also why one non-technical
   founder plus Claude can run this at all.

---

## 4. How we're different

The space is crowded — let's be honest about that — but crowded with things
that miss ordinary people:

| What exists today | Why it doesn't serve our customer |
|---|---|
| Developer platforms & AI toolkits | Powerful, but you need to be (or hire) a programmer |
| Business chatbot builders | Aimed at companies; dashboards full of settings, flows, and jargon; pricing that scares off a solo seller |
| "Just use ChatGPT" | Generic; doesn't carry your knowledge, live on your website, or capture leads for you; your customers can't talk to it |
| Agencies (our old plan) | Done-for-you quality, but $1,000s per client — out of reach for almost everyone |

**Our angle — consumer-grade simplicity:**

- **One box, plain words.** The whole product starts with "describe what you
  need." No flow builders, no settings pages, no tutorial videos required.
- **Minutes, not meetings.** Description → a couple of follow-up questions →
  working agent you're already chatting with.
- **Refine by talking, not configuring.** "Make it friendlier" is the settings
  panel.
- **Try before anything.** The app runs on an honest demo engine even with no
  AI key connected — clearly badged "demo" — so there's zero cost or risk to
  playing with it. ([How that works](03-how-the-platform-works.md).)
- **Honest by design.** Agents are instructed never to invent prices, services,
  or facts, and to capture the visitor's details when they don't know —
  turning "I don't know" into a lead instead of a lie.

None of these is a fortress on its own. Our real bet is that **nobody is
combining them for ordinary people at an impulse-buy price** — and that being
genuinely pleasant and trustworthy at $19/month wins more of "anyone" than
being powerful and complicated at $500/month.

---

## 5. How it makes money — a hypothesis to validate

This is our **starting pricing hypothesis**, not a promise. We'll put it in
front of real users in phase ③ and let their behavior correct it.

| Plan | Price (hypothesis) | What you get |
|---|---|---|
| **Free** | $0 | 1 agent, a low monthly message cap, playground + shareable link (with a "made with AgentMint" badge) |
| **Pro** | ~$19/mo | Website widget, badge removal, higher message caps, full inbox |
| **Business** | ~$49/mo | Multiple agents, highest caps, priority support, (later) extra channels |

Why this shape:

- **Free tier** is the marketing budget. Personal agents (an expense tracker,
  a resume tailor) spread the product; the "made with AgentMint" badge on free
  agents' shared links advertises it.
- **Pro at ~$19** is impulse-buy territory for a solo seller or creator whose
  agent is capturing leads — cheaper than one missed customer.
- **Business at ~$49** is still 10–20× cheaper than the agency route, for
  customers whose agent is doing a receptionist's job.

**What we're watching to validate it** (this is the actual experiment):

- Do free users hit the message limit and *feel* it? (If nobody hits limits,
  the free tier is too generous or usage is too shallow.)
- Do people publish agents to a link/widget once that ships? (Publishing is
  the moment an agent becomes worth paying for.)
- Do business owners check their inbox and follow up on captured leads? (If
  leads sit unread, we haven't delivered value, whatever they paid.)
- Would raising Pro to $29 change signups? We can test that later; we can't
  test our way out of a product nobody publishes.

Costs stay small at first — roughly pennies of AI usage per active
conversation, plus modest hosting. The full picture, at 0 / 100 / 1,000
users, is in [Tech Stack & Costs](04-tech-stack-and-costs.md).

---

## 6. The staged path to "world-class"

The ambition is real: a place where *the world* goes to mint an agent. The
path there is a ladder, and we climb it one validated rung at a time — no fake
calendar dates, each phase earns the next
(full detail: [Roadmap](05-roadmap.md)).

| Phase | What exists at the end of it | Status |
|---|---|---|
| ① Factory + playground | Anyone can describe or grab an agent and use it in the app | **Built — awaiting customer-zero sign-off; it's in [`app/`](../app/)** |
| ② Accounts + publish | Agents live behind a real login, a shareable link, and a website embed widget, backed by a real database | Next |
| ③ Billing + launch | Free/Pro/Business plans live, product polished, publicly launched | After ② |
| ④ Beyond | More channels (WhatsApp, email), agents that *do* things (booking, sending email), a marketplace where users sell their agent templates | The long game |

"World-class," concretely, means: thousands of agents minted by people who
never read a manual; agents that act, not just answer; and a marketplace where
our users' creativity — not just our 50 flagship templates — stocks the
shelves. The
marketplace is the compounding step: every good agent someone builds makes
the platform better for the next person.

---

## 7. What we changed (and why)

This project began as a plan for a **done-for-you services agency** — pick a
niche, sell custom agents at $500–$1,500 setup plus a monthly retainer. That
plan is preserved in [`archive/services-era/`](../archive/services-era/README.md)
and is **superseded**: we chose to build the self-serve platform directly.

What we kept from that era: the warmth, the honesty about money, the "sell
outcomes, not technology" instinct, and its best product idea — the AI Front
Desk, whose answer-questions-and-capture-leads DNA lives on in every business
template in the gallery. What we dropped: selling our hours.
A platform's ceiling is higher, and — decisive for us — Claude can do all the
engineering, which removes the "months of engineering you can't afford" reason
the old plan gave for not building the platform first. Phase ① being already
built is the proof.

---

## 8. The risks, honestly

- **Crowded market.** Big players could ship a "make your own agent" feature.
  Our defense is focus: consumer-grade simplicity for ordinary people is a
  product culture, not a feature checkbox.
- **The pricing hypothesis may be wrong.** Maybe free users never convert;
  maybe $19 is too high for consumers and too low to matter. That's why it's
  framed as a hypothesis with named validation signals (section 5).
- **AI costs could bite at scale.** Message limits per tier exist precisely so
  heavy usage is paid usage. Numbers in [doc 04](04-tech-stack-and-costs.md).
- **One founder, no engineers.** Claude is the engineering team; you are
  decisions, taste, testing, and (later) marketing. That division of labor is
  spelled out in the [Founder Guide](06-founder-guide.md) — it's a strength
  only if we keep scope honest, which is what the roadmap's
  definition-of-done gates are for.

---

**Next:** what version 1 actually does, screen by screen →
[02 — Product Spec v1](02-product-spec-v1.md)
