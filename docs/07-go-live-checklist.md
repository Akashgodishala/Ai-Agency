# 07 — Go-Live Checklist: giving your agents their real brains

> The platform currently runs on the free **demo engine** (clearly labeled in
> the app). This page is the exact, non-technical path to switching on **live
> AI** — and what unlocks after that.

---

## Part 1 — Create your Anthropic account (~10 minutes, you do this)

Anthropic makes Claude, the AI that powers your agents. You need your own
account so the usage is billed to you and controlled by you.

1. **Go to** [console.anthropic.com](https://console.anthropic.com) and sign
   up with your email (`akash.godishala@gmail.com` works fine).
2. **Add billing.** In the console: *Settings → Billing → Add payment method.*
   Load **$5–$10 of credit** — that's genuinely enough for weeks of testing
   (a chat message costs about a cent; see [doc 04](04-tech-stack-and-costs.md)).
3. **Create an API key.** In the console: *API Keys → Create Key.* Name it
   `agentmint`. Copy the key — it looks like `sk-ant-...`.

### ⚠️ Treat the key like a bank-card number

- Anyone who has it can spend your AI credit. Don't post it publicly, don't
  email it around.
- If it ever leaks, go to the console and click **Revoke** — then make a new
  one. Two minutes, no harm done.
- Set a **monthly spend limit** in *Settings → Limits* (e.g. $25) so there are
  no surprise bills. Do this — it's the single best safety net.

## Part 2 — Put the key into the platform

Two places, depending on where the app is running:

- **While we develop (this repository):** the key goes in a file called
  `app/.env.local` on the machine running the app, containing one line:
  `ANTHROPIC_API_KEY=sk-ant-your-key-here`. This file is deliberately
  **never saved into the repository** (it's protected by `.gitignore`), so the
  secret stays out of the code. Tell Claude when you have the key and you'll be
  walked through it — or paste the line into the file yourself with any text
  editor.
- **When the site goes public (Vercel):** the key goes into the hosting
  dashboard instead — *Project → Settings → Environment Variables →*
  `ANTHROPIC_API_KEY`. Claude will walk you through this during deployment.

**That's the whole switch.** The moment the key is present, the app stops
saying "demo" and every agent — all 50 in the gallery and every custom one —
starts thinking with Claude. Nothing else changes; everything users taught
their agents carries over.

## Part 3 — What it unlocks (and what it doesn't)

**Unlocks now:** real conversation for every agent — natural answers grounded
in the owner's knowledge, smart follow-up questions in the factory, real
plain-English refinement.

**Still on the roadmap after this** (in build order, from
[the roadmap](05-roadmap.md)):

| Rung | Capability | Also needs |
|------|-----------|------------|
| 1 | Publish: share link + website widget | accounts + a database |
| 2 | Subscriptions (monthly & yearly) | your Stripe account |
| 3 | Texts, notifications & payment links | a messaging provider + Stripe |
| 4 | **Voice agents on a real phone number** | a telephony provider (e.g. Twilio) |

> **The north-star example we build toward** (the founder's own words): a
> liquor-store owner asks for a voice agent — it picks up the store's calls,
> texts customers when orders are ready for pickup, sends payment links, and
> notifies the store's app. Every rung above is a step toward exactly that.
> The waitlists on the site's "In development" section measure demand for
> these rungs while we climb.

---

← [Founder Guide](06-founder-guide.md) · [Back to docs index](../README.md)
