/**
 * Agent worlds — the capability territories the collection is organised into.
 *
 * These are not the same slicing as the gallery's categories: categories sort
 * by subject matter, worlds sort by *the kind of work the agent does for you*.
 * A visitor who doesn't know what they want browses worlds; one who does uses
 * the search.
 *
 * Every example exchange is honest about v1: the agent reasons over what you
 * paste and answers in text. Nothing here implies live integrations.
 */

export interface World {
  id: string;
  /** Roman numeral — these are territories, not a sequence. */
  mark: string;
  name: string;
  /** The promise, in the owner's language. */
  line: string;
  body: string;
  /** Agent names drawn from the real catalogue. */
  agents: string[];
  /** A short, real exchange this world's agents would have. */
  exchange: { from: "them" | "agent"; text: string }[];
}

export const WORLDS: World[] = [
  {
    id: "front",
    mark: "I",
    name: "Front of house",
    line: "The questions that never stop coming.",
    body: "Hours, prices, availability, policies, “can you do X” — answered from your own information, in your own manner, at two in the morning as readily as at two in the afternoon. Anything it can't answer, it takes a message.",
    agents: ["AI Customer Support Bot", "AI Recruiting Tool", "AI Menu Translator", "AI Knowledge Base"],
    exchange: [
      { from: "them", text: "Do you have anything for a party of six on Saturday night?" },
      { from: "agent", text: "We do — Saturdays fill early, so I'd book now. Reservations are recommended Friday and Saturday, and the kitchen closes at 10pm. Shall I take your name and number for the team?" },
    ],
  },
  {
    id: "money",
    mark: "II",
    name: "Money and documents",
    line: "The paperwork you keep meaning to get to.",
    body: "Invoices drafted, statements reconciled, contracts read closely, expenses sorted. You paste what you've got — an export, a photo's worth of typing, a wall of legal text — and get back something you can act on.",
    agents: ["AI Invoice Automation", "AI Contract Reviewer", "AI Statement Reconciler", "AI Expense Tracker"],
    exchange: [
      { from: "them", text: "This freelance agreement has a clause about unlimited revisions. Is that normal?" },
      { from: "agent", text: "It isn't, and it's the clause most likely to cost you. Unbounded revisions with a fixed fee means your rate falls with every round. A fairer version caps rounds and prices further ones separately — here's wording you could propose." },
    ],
  },
  {
    id: "growth",
    mark: "III",
    name: "Growth",
    line: "The outreach you'd do if you had the hours.",
    body: "Cold emails that sound like a person wrote them, ad copy worth testing, proposals that scope the work properly, articles that answer what people actually search for. Drafted for you to send — never sent behind your back.",
    agents: ["AI Cold Email Writer", "AI Ad Optimizer", "AI Proposal Writer", "AI SEO Writer"],
    exchange: [
      { from: "them", text: "My reply rate is about 1%. Here's the email I've been sending." },
      { from: "agent", text: "The opener is about you, not them — three sentences before they learn what's in it for them. It also asks for a 30-minute call from a stranger. Here's a rewrite that leads with their problem and asks a question instead." },
    ],
  },
  {
    id: "ops",
    mark: "IV",
    name: "Operations",
    line: "The decisions that need a second pair of eyes.",
    body: "What to reorder and when, whether a supplier's quote adds up, whether the work meets your own checklist, how to move data between the tools you already run. Working from your numbers, showing its arithmetic.",
    agents: ["AI Demand Forecasting", "AI Supplier Verifier", "AI Quality Inspector", "AI Data Connector"],
    exchange: [
      { from: "them", text: "Twelve weeks of sales, pasted below. Supplier lead time is three weeks. What do I order for December?" },
      { from: "agent", text: "Sea Salt is trending up about 9% a month; Fig spiked once on a promo, so treat that week as an outlier. For December I'd order 260–300 Sea Salt and 120–140 Fig, placed by the 8th to clear the lead time. Here's the working." },
    ],
  },
  {
    id: "judgment",
    mark: "V",
    name: "Judgment calls",
    line: "The moments before you commit money.",
    body: "Is this listing real? Is this charge yours? Is this a fair price? Is this bottle genuine? Agents that slow you down at exactly the right moment and tell you what to verify — never declaring certainty they don't have.",
    agents: ["AI Fraud Detector", "AI Listing Detector", "AI Real Estate Valuer", "AI Product Authenticator"],
    exchange: [
      { from: "them", text: "The landlord says he's abroad and will post the keys once I've paid the deposit." },
      { from: "agent", text: "That's the single most common rental scam pattern — remote owner, keys by post, money before viewing. I can't tell you it's fraud, but I'd treat it as unsafe until you've viewed the property in person and confirmed ownership. Here's exactly what to check." },
    ],
  },
];
