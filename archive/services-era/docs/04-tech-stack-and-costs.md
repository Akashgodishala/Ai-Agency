# 04 — Tech Stack & Costs

> Written for someone who does **not** code. The point of this page: you can run
> a real AI agency by **orchestrating tools**, not by programming. And where real
> code is needed, I write it for you.

---

## The mental model: you're an assembler, not a manufacturer

You don't manufacture the AI (companies like Anthropic do that). You **assemble**
existing pieces into a solution for a client — like a general contractor who
doesn't make bricks but builds the house. The pieces:

| Layer | What it does | Example tools |
|-------|--------------|---------------|
| **The brain (LLM)** | Reasoning & language | Claude (Anthropic) — top-tier for agents |
| **Agent builder** | Configures the agent visually | Voiceflow, Botpress, Chatbase, Relevance AI, Stack AI |
| **Automation / glue** | Connects agent to other systems | n8n, Make, Zapier |
| **Knowledge store** | Lets the agent look up facts | Built into most agent builders; or a vector DB |
| **Channels** | Where users talk to it | Website chat widget, WhatsApp, Slack, email, phone |
| **Client-facing bits** | Site, forms, dashboards, CRM | Framer/Carrd (site), Tally (forms), Airtable/HubSpot (CRM) |
| **Custom code** | Anything the above can't do | **I build this for you** |

> You do **not** need all of these on day one. You need a brain + one agent
> builder + one channel to build your first demo.

---

## Recommended starter stack (keep it minimal)

- **LLM:** Claude (via a provider or built into your agent builder).
- **Agent builder:** pick **one** no-code builder and learn it well. (Chatbase or
  Botpress are common easy starts for chat support/lead agents.)
- **Automation:** **n8n** (powerful, can self-host cheaply) or **Make** (easier
  UI). Start with one.
- **Website:** Carrd or Framer for a simple landing page.
- **Intake forms:** Tally or Google Forms.
- **CRM / tracking:** Airtable or a free HubSpot account.
- **Scheduling:** Cal.com or Calendly.
- **Custom software when needed:** this repository + me (Claude Code).

---

## Realistic monthly cost to start

| Item | Cost to start |
|------|---------------|
| LLM API usage (first clients) | $20–$100/mo (clients' usage; often passed through) |
| Agent builder subscription | $0–$100/mo (free tiers exist) |
| Automation tool (n8n/Make) | $0–$50/mo |
| Website + forms | $0–$30/mo |
| CRM / scheduling | $0 (free tiers) |
| Domain + email | ~$15/mo |
| **Total to get your first client** | **~$50–$300/mo** |

> You can genuinely start for **under a few hundred dollars a month.** You don't
> need investment to begin. Your first client's setup fee should cover months of
> tool costs.

---

## How a non-technical founder ships real software (this is the key)

Three tiers, use the lowest one that works:

1. **No-code first.** Most standard agents (support, lead, scheduling) are built
   entirely in a no-code agent builder. You configure; nothing to program.

2. **Automation for connections.** When the agent must talk to a calendar, CRM,
   email, or spreadsheet, you wire it up in n8n/Make with visual blocks.

3. **Me (Claude Code) for the custom 10%.** When a client needs something the
   tools can't do — a custom integration, a special dashboard, a unique workflow,
   your own internal tooling — you describe it to me in plain English and **I
   write, test, and deploy the code** into this repository. You review the result,
   not the code.

This is why you can build a "world-class" agency without coding: the no-code
tools handle the common cases, and I handle the custom engineering on demand.

---

## Security & data handling (don't skip — it builds trust)

Clients will hand you sensitive data. Basic rules that keep you safe and
credible:

- Only collect the data an agent actually needs.
- Use the business/enterprise tiers of tools when handling personal or health
  data (they offer data-protection agreements).
- Never let an agent take irreversible actions (refunds, deletions) without a
  human check or a hard limit.
- Have a simple privacy policy and a data-handling clause in your client
  contract.
- For regulated niches (health, legal, finance), learn the basic rules **before**
  selling there — I can help you understand the requirements.

---

## What this repository is for

This repo isn't just docs. Over time it holds:

- Your **internal tools** (intake app, client dashboard, reporting).
- **Reusable agent templates** and configs.
- **Custom code** I build for specific clients.
- Your **landing page / demos**.

It becomes the codebase of the eventual platform — grown one client at a time.

→ Continue to [05 — 90-Day Roadmap](05-roadmap-90-days.md)
