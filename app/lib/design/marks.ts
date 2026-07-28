/**
 * ============================================================================
 * THE MARK SYSTEM — one engraved identity per agent.
 * ============================================================================
 * Every agent has its own symbol. All fifty are drawn on the same 24×24 grid
 * with one stroke weight, so they read as one minted family while staying
 * individually recognisable.
 *
 *   cartouche — the outer container, one per world (says where it's from)
 *   glyph     — the inner strokes, unique per agent (says what it does)
 *   solids    — at most one filled dot, used only where it carries meaning
 */

export type WorldKey = "money" | "home" | "work" | "market" | "trade" | "life";

/** The six containers, all inscribed in the same 20-unit circle. */
export const CARTOUCHE: Record<WorldKey, string> = {
  money: "M12 2.4 20.3 7.2v9.6L12 21.6 3.7 16.8V7.2Z",
  home: "M4 10.4 12 3l8 7.4v7.2a1.4 1.4 0 0 1-1.4 1.4H5.4A1.4 1.4 0 0 1 4 17.6Z",
  work: "M5.8 3.4h12.4a2.4 2.4 0 0 1 2.4 2.4v12.4a2.4 2.4 0 0 1-2.4 2.4H5.8a2.4 2.4 0 0 1-2.4-2.4V5.8a2.4 2.4 0 0 1 2.4-2.4Z",
  market: "M12 2.8a9.2 9.2 0 1 1 0 18.4 9.2 9.2 0 0 1 0-18.4Z",
  trade: "M12 2.6 21.4 12 12 21.4 2.6 12Z",
  life: "M12 2.6c5 0 9 4 9 9v9.8H3V11.6c0-5 4-9 9-9Z",
};

/** Which world each category belongs to. */
export const WORLD_OF: Record<string, WorldKey> = {
  "Money & Finance": "money",
  "Home & Real Estate": "home",
  "Work & Documents": "work",
  "Marketing & Growth": "market",
  "Commerce & Retail": "trade",
  "Career & Life": "life",
};

export interface Mark {
  world: WorldKey;
  /** Stroked paths making up the glyph. */
  g: string[];
  /** Optional filled dots: [cx, cy, r]. */
  dots?: [number, number, number][];
}

/**
 * Fifty marks. The motif always comes from what the agent actually does.
 */
export const MARKS: Record<string, Mark> = {
  // ---------- MONEY & FINANCE · hexagon ----------
  "expense-tracker": { world: "money", g: ["M8.5 16.5v-4.5M12 16.5V8.5M15.5 16.5v-2.5", "M7 16.5h10"] },
  "saas-auditor": { world: "money", g: ["M10.2 12a2.9 2.9 0 1 1 5.8 0 2.9 2.9 0 0 1-5.8 0", "M8 12a2.9 2.9 0 1 1 5.8 0 2.9 2.9 0 0 1-5.8 0"] },
  "invoice-automation": { world: "money", g: ["M8.5 7.5h5.5L16 9.6v6.9H8.5Z", "M11 12.6h3.2M13.2 11.2l1.4 1.4-1.4 1.4"] },
  "statement-reconciler": { world: "money", g: ["M8 9.5h3.2M8 12.5h3.2M8 15.5h3.2", "M13 9.5h3.2M13 13.5h3.2"] },
  "insurance-explainer": { world: "money", g: ["M6.8 13.2a5.2 5.2 0 0 1 10.4 0Z", "M12 13.2v3.6"] },
  "cash-back-decoder": { world: "money", g: ["M7.6 14.6 9 9.4l6.4 1.7-1.4 5.2Z", "M8.6 12.6l6.2 1.6"] },
  "investing-assistant": { world: "money", g: ["M7.5 15.8c3 0 3.6-6.4 9-6.4", "M13.6 9.4h2.9v2.9"] },
  "payroll-tool": { world: "money", g: ["M7 15.6h10", "M8.6 15.6v-2M11 15.6v-3.4M13.4 15.6v-2.6M15.8 15.6v-4.2"] },
  "tax-helper": { world: "money", g: ["M8 9.4h8", "M12 9.4v6.6", "M9.4 16h5.2"] },
  "receipt-organizer": { world: "money", g: ["M8 16h8M8.6 13.2h6.8M9.2 10.4h5.6"] },
  "payment-negotiator": { world: "money", g: ["M7.6 10.8a4.4 4.4 0 0 1 8.8 0", "M9.2 15.4h5.6"] },
  "fraud-detector": { world: "money", g: ["M7.6 12a4.4 4.4 0 0 1 8.8 0", "M16.4 12a4.4 4.4 0 0 1-6.2 4"], dots: [[8, 15.8, 1.5]] },
  "fee-checker": { world: "money", g: ["M8 15.6 12 8.4l4 7.2", "M9.8 13h4.4"] },

  // ---------- HOME & REAL ESTATE · gable ----------
  "neighborhood-reports": { world: "home", g: ["M7 16.4v-2.8l2-1.9 2 1.9v2.8", "M13 16.4v-3.4l2-1.9 2 1.9v3.4"] },
  "listing-detector": { world: "home", g: ["M8 16.2v-4.1l4-3.2 4 3.2v4.1", "M7 17.4 17 9.6"] },
  "dampness-detector": { world: "home", g: ["M12 8.6c2 2.6 3.2 4.2 3.2 5.6a3.2 3.2 0 0 1-6.4 0c0-1.4 1.2-3 3.2-5.6Z"] },
  "commute-verifier": { world: "home", g: ["M8 15.4c2.6-4.2 5.4-4.2 8 0"], dots: [[8, 15.4, 1.4], [16, 15.4, 1.4]] },
  "real-estate-valuer": { world: "home", g: ["M8 12.4 12 9l4 3.4", "M7.4 15h9.2", "M12 13v2"] },

  // ---------- WORK & DOCUMENTS · tablet ----------
  design: { world: "work", g: ["M8 16.4a6 6 0 0 1 8-5.6", "M8 16.4h8.4"] },
  "meeting-summarizer": { world: "work", g: ["M7.4 8.6h9.2M8 11.6h8M9.4 14.6h5.2M10.8 17.4h2.4"] },
  "mini-crm": { world: "work", g: ["M7 15.4h10"], dots: [[8.4, 15.4, 1.3], [12, 15.4, 1.3], [15.6, 11.6, 1.3]] },
  "data-connector": { world: "work", g: ["M7.4 8.6h3.2v3.2H7.4Z", "M13.4 12.4h3.2v3.2h-3.2Z", "M10.6 10.2h3v4h-2.6"] },
  "security-scanner": { world: "work", g: ["M12 7.6 16 9v3.6c0 2.4-1.8 3.8-4 4.6-2.2-.8-4-2.2-4-4.6V9Z", "M8 12.6h8"] },
  "document-reader": { world: "work", g: ["M8.6 7.4h4.8L16 10v6.6H8.6Z", "M13.4 7.4V10H16", "M10.4 13h3.4"] },
  "contract-reviewer": { world: "work", g: ["M12 8.2v8", "M8.4 10.8h7.2", "M8.4 10.8 7 14.2h2.8ZM15.6 10.8l-1.4 3.4H17Z"] },
  "knowledge-base": { world: "work", g: ["M7.2 9.4h9.6M7.6 12.6h8.8M8.8 15.8h6.4"] },
  "feedback-reader": { world: "work", g: ["M7.4 15.8v-2.4M10 15.8v-4.4M12.6 15.8v-3.2M15.2 15.8v-5.6", "M7 8.6h9"] },
  "quality-inspector": { world: "work", g: ["M8 9.4h8M8 12.4h8M8 15.4h4.4", "M14 14.6l1.2 1.2 2-2.4"] },

  // ---------- MARKETING & GROWTH · circle ----------
  "ad-optimizer": { world: "market", g: ["M9 16a5 5 0 0 1 0-8", "M15 8a5 5 0 0 1 0 8"], dots: [[12, 12, 1.8]] },
  "lead-finder": { world: "market", g: ["M13.4 10.6a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2"], dots: [[8.4, 9.4, 1.1], [8.4, 14.2, 1.1], [12, 7.8, 1.1]] },
  "cold-email-writer": { world: "market", g: ["M7.4 14.2v-3.4l9-2.4-2.6 9-2.4-3.4Z", "M7.4 14.2 16.4 8.4"] },
  "proposal-writer": { world: "market", g: ["M8 8h5.2v8H8Z", "M13.2 9.4H16v6.6h-2.8"], dots: [[15, 8.4, 1.2]] },
  "seo-writer": { world: "market", g: ["M7.4 16v-2.6h3.1v-2.6h3.1V8.2h3.2"] },
  "email-campaigns": { world: "market", g: ["M7.6 12.4h7.2v4.2H7.6Z", "M7.6 12.4l3.6 2.6 3.6-2.6", "M9.4 10.2h7.2M11 8h5.6"] },
  "market-research": { world: "market", g: ["M12 7.4v9.2M7.4 12h9.2"], dots: [[14.8, 9.4, 1.6]] },
  "reputation-monitor": { world: "market", g: ["M12 7.6l1.9 3.9 4.3.6-3.1 3 .7 4.2-3.8-2-3.8 2 .7-4.2-3.1-3 4.3-.6Z"] },
  "pricing-optimizer": { world: "market", g: ["M7 12.6h10", "M7 16h10"], dots: [[10.4, 12.6, 1.6], [14.4, 16, 1.6]] },
  "customer-support-bot": { world: "market", g: ["M8 15.6a4.6 4.6 0 1 1 3.4 1.4H8Z"], dots: [[12.4, 12.4, 1.3]] },
  "voice-agent": { world: "market", g: ["M9 14.4v-4.8M12 16.4V7.6M15 14.4v-4.8", "M6.6 13v-2M17.4 13v-2"] },
  "sales-scorer": { world: "market", g: ["M7 16h10", "M8.6 16v-2.2M11.2 16v-3.6M13.8 16v-5M16.4 16v-6.6"], dots: [[13.8, 10.6, 1.4]] },

  // ---------- COMMERCE & RETAIL · lozenge ----------
  "demand-forecasting": { world: "trade", g: ["M7.4 15.4c2.6 0 3.4-5.2 5.2-5.2 1.4 0 1.8 2.6 3.6 2.6", "M16.6 12.8h1.6"] },
  "supplier-verifier": { world: "trade", g: ["M8 10.4h8v6H8Z", "M8 12.6h8", "M10.4 14.2l1.2 1.2 2.4-2.6"] },
  "product-authenticator": { world: "trade", g: ["M12 7.4 16.6 12 12 16.6 7.4 12Z", "M12 10 14 12l-2 2-2-2Z"] },
  "fashion-preview": { world: "trade", g: ["M12 8.6a1.4 1.4 0 1 1 1.4 1.4c0 .8-1.4 1-1.4 1.8", "M12 11.8 7.6 15.4h8.8Z"] },
  "reverse-pricing": { world: "trade", g: ["M16.4 12H8.4", "M10.6 9.8 8.4 12l2.2 2.2", "M16.4 9v6"] },
  "gift-recommender": { world: "trade", g: ["M12 10.4c-1.6-2.2-4.2-1-3.4 1 .4 1 2 1.2 3.4 1.2s3-.2 3.4-1.2c.8-2-1.8-3.2-3.4-1Z", "M12 12.6v4"] },
  "menu-translator": { world: "trade", g: ["M8.4 15.6 10.8 8.8l2.4 6.8", "M9.2 13.6h3.2", "M14.4 10.6h3.2M16 10.6v5"] },

  // ---------- CAREER & LIFE · arch ----------
  "resume-tailor": { world: "life", g: ["M8.6 8h6.8v9H8.6Z", "M15.4 8 8.6 14.6", "M10.4 16.2h3"] },
  "recruiting-tool": { world: "life", g: ["M12 9.4a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4", "M8 18.2a4 4 0 0 1 8 0", "M14.6 11.2l1.2 1.2 2-2.4"] },
  "travel-planner": { world: "life", g: ["M8 16.6c1.6-3.4 3-1.6 4-4s2.4-1.4 4-3.6"], dots: [[8, 16.6, 1.3], [12, 12.6, 1.2], [16, 9, 1.5]] },
};

/** Fallback for a custom-minted agent that has no catalogue mark. */
export const CUSTOM_MARK: Mark = {
  world: "market",
  g: ["M12 7.6v8.8M7.6 12h8.8", "M9 9l6 6M15 9l-6 6"],
};

export function markFor(templateId: string): Mark {
  return MARKS[templateId] ?? CUSTOM_MARK;
}
