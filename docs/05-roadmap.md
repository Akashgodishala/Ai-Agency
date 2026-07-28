# 05 — Roadmap

> **In one line:** four phases — ① factory + playground (built — awaiting
> sign-off), ② accounts + publish, ③ billing + launch, ④ beyond — each with a
> plain definition of done, and no calendar dates, because dates would be
> theater and the gates are the real schedule.

This document answers: what gets built in what order, how we know a phase is
actually finished, and how we decide to move to the next one. What we're
building and why is in [01 — Vision & Strategy](01-vision-and-strategy.md);
what exists today is in [02 — Product Spec v1](02-product-spec-v1.md).

---

## 1. How this roadmap works (read this first)

Three rules, and they do a lot of work:

1. **No calendar promises.** We won't write "Phase ② ships in March." A
   one-founder-plus-Claude team doesn't gain anything from pretend deadlines —
   it gains from honest gates. The engineering for each phase is measured in
   days-to-weeks of Claude's work; the genuinely slow (and genuinely valuable)
   parts are your testing, your decisions, and real users' reactions. Those
   can't be scheduled, only respected.
2. **Every phase has a definition of done** — a checklist in plain English.
   A phase is finished when every box is checked, not when we're bored of it.
3. **Moving on is a decision, not a drift.** When a phase's checklist is
   green, we stop and consciously decide to advance (section 7 says exactly
   how). We never half-build two phases at once, and we never pull a fun
   phase-④ feature forward "because it's easy."

---

## 2. Phase ① — Factory + playground (Built — awaiting customer-zero sign-off)

**The goal was:** anyone can describe an agent (or grab one from the gallery)
and be chatting with it minutes later, entirely inside the app — with zero
running costs and no API key required.

**Definition of done** (the app is in [`app/`](../app/); one box stays open
until the founder's own test passes):

- [x] Landing page with the "magic box" and four tappable example descriptions
- [x] Follow-up questions page — every question optional, nobody gets stuck
- [x] The agent factory: description + answers + knowledge → a working agent
- [x] Gallery of ready-made agents, one click to grab — launched with six
      starters, since expanded to 50 flagship agents across six categories
      (the current lineup is in [doc 02](02-product-spec-v1.md))
- [x] Playground: chat, plain-English **Refine**, and the **Inbox** of
      captured leads
- [x] "My agents" shelf, plus export-config backup and delete
- [x] The honest **demo engine**: everything works with no API key, clearly
      badged "demo"; adding an `ANTHROPIC_API_KEY` switches to live AI
- [ ] The three-minute test: Claude's technical checks pass; the founder's
      own test is pending (a first-timer going from landing page to chatting
      with an agent that sounds like what they asked for, unaided)

**Still open inside this phase (small, but real):**

- [ ] You create an Anthropic account and connect an API key, so you can feel
      the difference between demo and live AI yourself (how-to and costs:
      [doc 04](04-tech-stack-and-costs.md); what the key is:
      [doc 06 glossary](06-founder-guide.md))
- [ ] You run the customer-zero test script ([doc 06](06-founder-guide.md))
      and we fix whatever it turns up

---

## 3. Phase ② — Accounts + publish (the "it's alive" phase) ⬅ next

**The goal:** an agent stops being a private toy in one browser and becomes a
real thing on the internet — behind a login, on our servers, reachable by
strangers through a link or a widget on its owner's website.

This is the most important phase in the whole plan. Publishing is the moment
an agent starts earning its keep — leads from real strangers land in the
inbox — and it's the moment our pricing hypothesis
([doc 01, section 5](01-vision-and-strategy.md)) becomes testable at all.

**What gets built:**

| Piece | What it means in practice |
|---|---|
| Accounts | Simple email sign-up / log-in. Your agents follow you across devices instead of living in one browser. |
| Real database | Agents and inboxes move from browser storage to our servers. The code was structured from day one so no screen has to change ([doc 02, section 5](02-product-spec-v1.md)). |
| Shareable link | Every agent can get a public page — send the link to anyone and they're chatting with your agent. |
| Website embed widget | A small snippet the owner pastes into their website; the agent appears as a chat bubble on their own site. |
| Inbox, for real | Captures now come from actual strangers, not just your own test chats. |
| Sensible caps | Per-agent message limits even before billing exists — so a popular (or abused) public agent can't surprise us with an AI bill. |

**Definition of done:**

- [ ] Sign up on one device, open the site on another, your agents are there
- [ ] Publish an agent to a link; a stranger (or you in an incognito window)
      can chat with it without any account
- [ ] Embed the widget on a test web page; it works there too
- [ ] A lead captured through the public link shows up in the owner's inbox
- [ ] Message caps quietly protect us from runaway usage
- [ ] Nothing that worked in phase ① got worse
- [ ] Customer-zero test: you publish an agent, open its link on your phone,
      leave yourself a lead, and find it in your inbox — no help, no apologies

**What we're watching (the phase-② experiment):** do the handful of people we
show this to actually *publish* their agents, and do strangers actually chat?
If agents get minted but never published, we've built a toy, and we need to
understand why before charging money for it.

**Founder accounts needed this phase:** hosting, a domain name (which means
picking the real name first — your call), and a database service. The
what/when/cost of each is in [doc 04](04-tech-stack-and-costs.md); the
checklist lives in [doc 06](06-founder-guide.md).

---

## 4. Phase ③ — Billing + polish + launch

**The goal:** the product charges money, feels finished, and is publicly
announced.

**What gets built:**

| Piece | What it means in practice |
|---|---|
| Plans + billing | The Free / Pro (~$19) / Business (~$49) hypothesis goes live via Stripe: checkout, upgrade, cancel, and limits actually enforced per plan. Free keeps 1 agent, a low message cap, and a shareable link with a "made with AgentMint" badge; Pro adds the website widget, badge removal, higher caps, and the full inbox; Business adds multiple agents, the highest caps, and priority support ([doc 01, section 5](01-vision-and-strategy.md)). This is also when the gallery's "Get this agent" step gains real checkout — it needs the founder's Stripe account. Prices stay a hypothesis until real behavior confirms them. |
| Polish pass | Onboarding, empty states, error messages, mobile — the hundred small things between "works" and "feels good." |
| Real identity | The real name (you pick it), the domain, the look. "AgentMint" retires or gets confirmed. |
| The boring-but-required | Terms of service and privacy policy, done properly — we're storing strangers' contact details in inboxes, so this isn't optional. |
| Launch | Actually telling the world: the channels and the pitch are your department, with Claude drafting whatever helps. |

**Definition of done:**

- [ ] A stranger can sign up, hit the free tier's limits, upgrade to Pro with
      a real card, and cancel — all without emailing us
- [ ] Limits match plans; the demo badge / live behavior is honest at every tier
- [ ] The product carries its real name and domain
- [ ] Terms + privacy policy are published
- [ ] Customer-zero test: you'd send the link to a friend without any
      "ignore that part, it's not done" warnings
- [ ] It's publicly launched — announced somewhere real people saw it

**What we're watching (the phase-③ experiment):** the validation signals from
[doc 01, section 5](01-vision-and-strategy.md) — do free users feel the
limits, do publishers convert to Pro, do business owners follow up on their
leads? And the bluntest one: **does anyone pay?** The first paying stranger
is worth more than a thousand compliments.

---

## 5. Phase ④ — Beyond (a menu, not a phase)

Everything here is deliberately unscheduled. Phase ④ isn't one phase — it's a
menu we order from **only when current users are asking**, one item at a
time, each with its own definition of done written when we start it.

| Menu item | What it unlocks | What must be true first |
|---|---|---|
| More channels (WhatsApp, email…) | Agents meet customers where they already are | Widget/link usage proves demand for a second channel |
| Agents that take actions (booking, sending email) | From answering to *doing* — the big value jump | Trust and safety design first; an agent that acts can also act wrong |
| File uploads as knowledge (PDFs, docs) | Easier knowledge for document-heavy owners | Users actually hitting the paste-a-page limit |
| Reading whole websites (many pages) | Richer knowledge for bigger sites | Same — demand, not hope |
| Analytics for owners | See conversations, spot gaps in knowledge | Enough real traffic that there's something to analyze |
| Template marketplace | Users sell their agent templates; the platform stocks its own shelves | A thriving user base — the compounding step in [doc 01, section 6](01-vision-and-strategy.md) |

The rule for this whole table: **demand pulls; we don't push.** Every item
here is real work and real risk (actions especially), and the graveyard of
platforms is full of features nobody asked for.

---

## 6. The roadmap at a glance

| Phase | Nickname | It's done when… | Status |
|---|---|---|---|
| ① Factory + playground | "It works" | A first-timer mints and chats in under 3 minutes | Built — awaiting customer-zero sign-off |
| ② Accounts + publish | "It's alive" | A stranger chats with your published agent; the lead lands in your inbox | Next |
| ③ Billing + launch | "It's a business" | A stranger can pay us without talking to us; the world's been told | After ② |
| ④ Beyond | "It compounds" | Ordered item by item, on demand | The long game |

---

## 7. How we decide to move to the next phase

Advancing takes all four, in order:

1. **The checklist is green.** Every definition-of-done box for the current
   phase, no "basically done" items.
2. **Customer zero signs off.** You've personally run the test script from
   the [Founder Guide](06-founder-guide.md) on the finished phase and you'd
   demo it to a friend without apologizing for anything.
3. **The phase's experiment says go.** Each phase watches for a signal
   (② people publish; ③ people pay). The signal doesn't need to be
   overwhelming — but if it's flatly absent, we stop and understand why
   before building the next thing on top.
4. **You say go.** Moving on is a founder decision, made out loud. Claude
   will lay out the evidence and a recommendation; the call is yours.

**And one honest escape hatch:** the roadmap serves the validation, not the
other way around. If real users loudly want something out of order — say,
file uploads before the widget — we'll consider reshuffling, *on purpose,
with the trade-offs written down*. What we won't do is drift.

---

**Next:** your role, Claude's role, how to test and ask for changes, and the
glossary → [06 — Founder Guide](06-founder-guide.md)
