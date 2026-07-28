# 08 — Integrations Blueprint: Stripe, Twilio, and VAPI

> The founder has confirmed the vendor stack for the platform's next rungs:
> **Stripe** for subscriptions and payment links, **Twilio** for text messages,
> and **VAPI** for voice agents on real phone numbers. This page is the
> plain-English blueprint for how they plug in — written before the build so
> we both know exactly what's coming.

---

## 1. The one prerequisite everything shares

Today, each agent lives in its creator's **browser**. A phone call, a text, or
a payment can't reach into someone's browser — so before any integration:

**Agents must move to our server** (the accounts + database + publish phase,
rung 1 on the ladder). That phase is not optional plumbing; it *is* the
platform becoming real. Every integration below assumes it's done.

## 2. The vendor stack, in one table

| Vendor | What it gives us | How it charges (ballpark — verify current pricing) |
|--------|------------------|------------------------------------|
| **Stripe** | Subscriptions (monthly & yearly plans), payment links we can text to customers | No monthly fee; ~2.9% + 30¢ per transaction |
| **Twilio** | Sending SMS (order-ready alerts, payment-link texts); business phone numbers | ~$1/mo per number; fractions of a cent per SMS |
| **VAPI** | The voice agent itself — answers calls on a real number, speaks naturally, follows our agent's instructions, and reports back what happened | Per minute of talk time (roughly $0.05–$0.15/min + call costs) |

They compose, not compete: VAPI answers the call, Twilio sends the follow-up
text, Stripe takes the payment.

## 3. The liquor-store flow, end to end (the north star)

What actually happens when the founder's example use case runs on this stack:

1. **Setup (once):** the store owner grabs a Receptionist agent on AgentMint,
   teaches it the store's info, and upgrades it to voice. Behind the scenes we
   create a VAPI assistant from that same agent's instructions and knowledge,
   and connect a phone number to it.
2. **A customer calls the store.** VAPI answers as the agent — hours, stock
   questions, "can I place a pickup order?" — all from the owner's knowledge.
3. **The order is taken.** When the call ends, VAPI sends our server a summary
   of what happened (the transcript plus structured details like the order and
   the customer's number).
4. **Our server acts on it:** texts the customer via Twilio ("your order's
   ready at 6pm"), attaches a Stripe payment link if payment is wanted, and —
   if the owner connected one — notifies the store's own app.
5. **The owner sees it all** in their AgentMint inbox: the call, the order,
   the payment status. They did nothing.

The same skeleton serves every business type — clinic bookings, salon
reminders, contractor callbacks — only the agent's knowledge changes.

## 4. What the founder provides, and exactly when

**Nothing needs to be bought today.** Keys are collected per rung, right
before that rung is built — collecting them early just creates secrets to
babysit.

| When | Account | What to grab | Cost to start |
|------|---------|--------------|---------------|
| **Now** | Anthropic ([checklist](07-go-live-checklist.md)) | `ANTHROPIC_API_KEY` | $5–10 credit |
| Rung 2 (subscriptions) | Stripe | secret key + webhook secret | free to open |
| Rung 3 (texts) | Twilio | account SID, auth token, a phone number | ~$20 trial credit works |
| Rung 4 (voice) | VAPI | API key (+ webhook secret) | pay-as-you-go |

**Handling keys safely:** same rule as the Anthropic key — they're bank-card
numbers. They go into the app's private environment settings (never into the
code repository; `app/.env.example` shows the exact named slots waiting for
them). If one leaks, revoke it in that vendor's dashboard and issue a new one.

## 5. What this does to pricing

Voice minutes and SMS cost us real money per use, so voice-enabled plans will
be priced above the base tiers — most likely a **voice add-on** with a monthly
minute allowance (e.g. base plan + $X/mo including N minutes, then per-minute
beyond). Exact numbers get decided with real VAPI bills in front of us, not
guessed now. Text-chat plans (~$19 / ~$49) are unaffected.

## 6. Build order from here (unchanged, now vendor-named)

1. **Live AI** — Anthropic key *(waiting on the founder — the current step)*
2. **Accounts + database + publish** — agents move server-side; share link + widget ship
3. **Subscriptions** — Stripe; monthly & yearly plans go live; "Get this agent" becomes real checkout
4. **Texts & payment links** — Twilio + Stripe payment links
5. **Voice agents** — VAPI; the waitlisted "Voice & Phone agents" card comes true

---

← [Go-Live Checklist](07-go-live-checklist.md) · [Back to docs index](../README.md)
