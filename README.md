# AgentMint <sub><sup>(working name — rename anytime)</sup></sub>

**A platform where anyone describes their use case and gets their own working AI
agent — in minutes, with no coding.**

Describe it → the factory mints an agent (or grab one from the gallery) → chat
with it instantly → refine it in plain English → publish it to a link or your
website (next phase) → subscribe to keep it.

This repository holds both the **product** (`app/`) and the **plan** (`docs/`),
written for a non-technical founder. You make decisions and test the product;
Claude does the engineering.

---

## The repo at a glance

| Folder | What's inside |
|--------|---------------|
| [`app/`](app/) | The platform itself — a Next.js web app (landing + magic box, gallery, agent factory, playground) |
| [`docs/`](docs/) | The plan: vision, product spec, how it works, tech & costs, roadmap, founder guide |
| [`archive/services-era/`](archive/services-era/) | The earlier "done-for-you agency" direction, kept for reference ([why](archive/services-era/README.md)) |

## Read the docs in this order

| # | Document | What it answers |
|---|----------|-----------------|
| 1 | [Vision & Strategy](docs/01-vision-and-strategy.md) | What we're building, for whom, and how it makes money |
| 2 | [Product Spec v1](docs/02-product-spec-v1.md) | Exactly what version 1 does, screen by screen |
| 3 | [How the Platform Works](docs/03-how-the-platform-works.md) | The 5 parts of the machine, in plain English |
| 4 | [Tech Stack & Costs](docs/04-tech-stack-and-costs.md) | What it's built with and what it costs to run |
| 5 | [Roadmap](docs/05-roadmap.md) | Phases from here to launch and beyond |
| 6 | [Founder Guide](docs/06-founder-guide.md) | Your role vs. Claude's, accounts you'll need, glossary |
| 7 | [Go-Live Checklist](docs/07-go-live-checklist.md) | Creating your Anthropic account, connecting the key, and the capability ladder to voice agents |
| 8 | [Integrations Blueprint](docs/08-integrations-blueprint.md) | How Stripe, Twilio, and VAPI power subscriptions, texts, payment links, and voice agents |

## Running the app (for whoever builds)

```bash
cd app
npm install
npm run dev        # → http://localhost:3000
```

Without an AI key the app runs on an honest **demo engine** (clearly badged in
the UI). To go live: copy `app/.env.example` to `app/.env.local` and add an
`ANTHROPIC_API_KEY`.

---

## Current status

- [x] Vision aligned: **self-serve platform, for anyone, describe-or-grab**
- [x] v1 scope set: agents that **answer from your knowledge + capture leads**, living at a **link + widget**
- [x] App v1 phase ① built: magic box → follow-up questions → agent factory → playground (chat, refine, inbox, gallery)
- [x] Planning docs rewritten for the platform vision
- [ ] Founder picks the real name (AgentMint is a placeholder)
- [ ] Anthropic API key connected (switches demo engine → live AI)
- [ ] Phase ②: accounts, publish (share link + website widget)
- [ ] Phase ③: billing (free tier + paid plans) and public launch
