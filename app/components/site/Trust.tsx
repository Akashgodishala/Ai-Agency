"use client";

import { MaskedLines } from "@/components/motion/MaskedLines";
import { useReveal } from "@/components/motion/hooks";

/**
 * Trust, built from assay marks — the small stamps that certify a coin's metal.
 *
 * Deliberately no logos, no invented customer counts, no fabricated
 * testimonials. Every line here is a verifiable fact about how the product
 * behaves. When there are real customers, their words replace this section's
 * lower half; until then, stating what's true beats inventing what isn't.
 */
const MARKS = [
  {
    stamp: "Grounded",
    title: "It answers from your information",
    body: "An agent works from what you give it — your notes, prices, policies, documents. When a question falls outside that, it says so and offers to take a message rather than inventing an answer.",
  },
  {
    stamp: "Bounded",
    title: "You set the lines it can't cross",
    body: "Every agent carries hard rules in plain English — never quote a final price, never give medical advice, always hand off an upset customer. Written by you, enforced on every reply.",
  },
  {
    stamp: "Yours",
    title: "Your data stays yours",
    body: "Agents and their inboxes are stored in your browser today. Messages pass through our server to reach the model and are not kept there. Accounts with proper storage arrive with publishing.",
  },
  {
    stamp: "Honest",
    title: "We say what isn't built yet",
    body: "Voice, texts, and payment links are on the roadmap below, marked as planned rather than dressed up as shipped. If an agent can't do something today, the site tells you so before you spend anything.",
  },
];

export function Trust() {
  const ref = useReveal<HTMLDivElement>({ selector: "[data-mark]", stagger: 0.1 });

  return (
    <section className="relative bg-ink border-t border-rule py-28 lg:py-40" aria-labelledby="trust-title">
      <div className="mx-auto max-w-sheet px-6">
        <div className="flex flex-col gap-4">
          <p className="assay">Assay marks</p>
          <MaskedLines as="h2" id="trust-title" className="text-display max-w-[19ch]" play="scroll">
            What you can count on before you spend anything.
          </MaskedLines>
        </div>

        <div ref={ref} className="mt-14 grid grid-cols-1 gap-px bg-rule md:grid-cols-2">
          {MARKS.map((m) => (
            <article key={m.stamp} data-mark className="flex flex-col gap-3 border border-rule bg-plate p-8 opacity-0">
              <span className="assay w-fit border border-mint-deep px-2.5 py-1 text-mint">
                {m.stamp}
              </span>
              <h3 className="font-display text-[1.4rem] leading-snug">{m.title}</h3>
              <p className="text-[0.93rem] leading-relaxed text-muted">{m.body}</p>
            </article>
          ))}
        </div>

        <p className="mt-8 max-w-measure text-sm text-dim">
          AgentMint is in early access. There are no customer logos on this page
          because there are no customers to name yet — when there are, their words
          will go here, with permission.
        </p>
      </div>
    </section>
  );
}
