# 02 — The Delivery System (the "Agent Factory")

> This is the heart of the business. It's the **repeatable process** that turns
> any client's use case into a working, delivered agent. When people say "AI
> agency solution," *this system* is the solution. Get this right and the
> business runs like a machine instead of chaos.

The factory has **6 stations**. Every client goes through the same 6 stations.
Over time each station gets faster and more templatized.

```
  1. INTAKE      2. DESIGN       3. BUILD        4. TEST        5. DEPLOY      6. SUPPORT
  ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
  │ Capture│ →  │ Map to │ →  │ Assemble│ → │  QA &  │ → │ Launch │ → │ Monitor│
  │use case│    │blueprint│    │  agent  │   │ verify │    │& train │    │ & tweak│
  └────────┘    └────────┘    └────────┘    └────────┘    └────────┘    └────────┘
```

---

## Station 1 — Intake (capture the use case)

**Goal:** understand exactly what the client wants, in a structured way, so
nothing is guesswork.

**Tool:** a standard **intake form** + a 30-minute discovery call.

The intake form asks (every client, same questions):

1. What business result do you want? (e.g. "reply to every lead instantly")
2. What's the task today — who does it, how long does it take, what does it cost?
3. Where does the agent need to live? (website chat, WhatsApp, email, phone, Slack, internal tool)
4. What does it need to *know*? (your FAQs, product docs, pricing, policies)
5. What does it need to *do*? (book a meeting, create a ticket, send an email, look something up)
6. What systems must it connect to? (calendar, CRM, email, database, spreadsheet)
7. What must it **never** do? (hard limits, compliance, escalation rules)
8. How will we know it's working? (the success metric)

> I can build this intake form as a real fill-in web form or a shared document.
> This is one of the first concrete things to create.

---

## Station 2 — Design (map use case → blueprint)

**Goal:** translate the intake answers into a concrete agent **blueprint**
before building anything.

Every agent, no matter the use case, is the same 5 ingredients:

| Ingredient | Plain-English meaning | Example (support agent) |
|------------|----------------------|-------------------------|
| **Brain** | The AI model that reasons & writes | Claude |
| **Instructions** | Its job description & personality & rules | "You are a friendly support rep for Acme. Never give refunds over $50 without escalating." |
| **Knowledge** | The facts it can look up | Acme's FAQ, policies, product docs |
| **Tools** | Actions it can take | Create a support ticket, check order status, book a call |
| **Channel** | Where the user talks to it | Website chat widget, WhatsApp |

Design = filling in those 5 boxes. Most use cases map to a template in the
[Agent Catalog](03-agent-catalog.md), so this becomes "pick the closest template
and customize," not "invent from scratch."

**Output of this station:** a one-page **Agent Spec** the client approves before
you build. (Approval here prevents expensive rework later.)

---

## Station 3 — Build (assemble the agent)

**Goal:** actually construct the agent. As a non-technical founder, you have
three ways to build, from easiest to most powerful:

1. **No-code agent builders** — drag-and-drop tools where you configure the 5
   ingredients visually. Fastest for standard use cases. (See
   [Tech Stack](04-tech-stack-and-costs.md).)
2. **No-code automation platforms** (n8n, Make, Zapier) — for connecting the
   agent to the client's other systems (calendar, CRM, email).
3. **AI-assisted custom build** — for anything the no-code tools can't do, *I
   (Claude Code) write the code for you.* You describe what you want in plain
   English; I build, test, and deploy it. This is your secret weapon: you get
   custom software without being a programmer.

**Principle:** use the simplest tool that does the job. Only drop to custom code
when a real client need requires it. Don't over-engineer.

---

## Station 4 — Test (QA & verify)

**Goal:** make sure it actually works before the client sees it. This is the
step amateurs skip and it's why their agents embarrass them.

A standard test checklist for every agent:

- [ ] Does it answer the **top 20 real questions** correctly?
- [ ] Does it **refuse or escalate** the things it must not handle?
- [ ] Does every **tool/action** work (booking actually books, email actually sends)?
- [ ] Does it stay **on-brand and on-policy**?
- [ ] What happens with **weird / rude / off-topic** input? (it shouldn't break)
- [ ] Is there a **human handoff** when it's stuck?

> Keep a reusable test script per agent type. I can generate these test scripts
> and even run automated tests for you.

---

## Station 5 — Deploy (launch & train the client)

**Goal:** get the agent live where real users reach it, and make sure the client
knows how to work with it.

- Put the agent on the agreed channel (embed chat on their site, connect WhatsApp, etc.).
- Give the client a **simple dashboard or report**: what the agent handled, what
  it escalated.
- **Train the client** (15-min walkthrough): how to review conversations, how to
  request changes, who to contact.
- Hand over a short **"owner's manual"** doc.

---

## Station 6 — Support (monitor, tweak, retain)

**Goal:** keep it working — this is what the monthly retainer pays for and what
makes clients stay for years.

- **Monitor** conversations weekly for mistakes or gaps.
- **Tweak** instructions and knowledge as the business changes.
- **Report** monthly: "your agent handled 480 conversations, booked 32 calls,
  saved ~40 hours." (This is what makes them never cancel.)
- **Upsell** the next agent once they trust you.

---

## Why this system is the actual product

- It's **repeatable** — same 6 stations for every client, so quality is
  consistent and you can hand stations to contractors.
- It's **templatizable** — Stations 2–4 get faster every time as your catalog
  grows.
- It's **the seed of the platform** — when Stations 1–3 are standardized enough,
  you put a web form in front of them and clients self-serve. That's business B,
  grown naturally from business A.

---

## What I can build for this system right now

- The **intake form** (as a real web form or structured doc).
- The **Agent Spec template** (Station 2 output).
- A library of **test checklists** (Station 4).
- The **client report template** (Station 6).
- **Working demo agents** you can show prospects (Station 3).

→ Continue to [03 — Agent Catalog](03-agent-catalog.md)
