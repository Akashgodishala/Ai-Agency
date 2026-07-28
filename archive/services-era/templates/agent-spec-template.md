# Agent Spec — [Client Name]

> Fill this out **before building** (Station 2 of the delivery system). The
> client approves it, then you build exactly this. It maps the intake answers to
> the 5 ingredients every agent is made of. Copy this file per client.

| Field | Value |
|-------|-------|
| Client | |
| Agent name | e.g. "Front Desk" |
| Date | |
| Package (Starter / Growth / Custom) | |
| Status | Draft / Approved / Built / Live |

---

## 1. Brain (the AI model)
- **Model:** Claude (default)
- **Why:** strong reasoning, follows rules well, natural tone.

## 2. Instructions (job description, personality, rules)
> This becomes the agent's system prompt. Be specific.

- **Role:** You are the front desk assistant for **[business]**.
- **Goal:** [the outcome from intake — e.g. answer questions and book appointments 24/7].
- **Voice / tone:** [e.g. warm, friendly, professional].
- **Always:** [greet, confirm details, offer to book, log the lead…]
- **Never:** [give clinical advice, quote final prices, process payments, invent info…]
- **Escalate to a human when:** [emergencies, complaints, billing disputes…]

## 3. Knowledge (facts it can look up)
> What the agent is allowed to answer from. List sources; attach/link the docs.

- [ ] Hours & location
- [ ] Services offered
- [ ] Pricing / insurance
- [ ] Policies (cancellation, new patient, etc.)
- [ ] FAQ document
- **Source files/links:**

## 4. Tools (actions it can take)
> Each action + the system it uses + any limits.

| Action | System | Limit / rule |
|--------|--------|--------------|
| Book appointment | [Google Calendar / Cal.com] | Only during business hours |
| Capture lead | [CRM / Airtable] | Always log name + contact |
| Send reminder | [SMS / email tool] | 24h before |
| Route to human | [email / Slack / phone] | On escalation triggers |

## 5. Channel (where users reach it)
- [ ] Website chat widget
- [ ] SMS / text-back
- [ ] WhatsApp
- [ ] Email
- [ ] Phone / voice

---

## Success metric
> How we'll prove it's working in the monthly report.

- Primary: [e.g. appointments booked / month]
- Secondary: [conversations handled, hours saved, response time]

## Test checklist (must pass before launch)
- [ ] Answers the top 20 real questions correctly
- [ ] Refuses / escalates everything in "Never"
- [ ] Every tool action works end-to-end
- [ ] Stays on-brand and on-policy
- [ ] Handles rude / off-topic / confusing input gracefully
- [ ] Human handoff works

## Client sign-off
- Approved by: __________________  Date: __________
