/**
 * ============================================================================
 * SCROLL INTEGRITY SWEEP — the standing guard against sections colliding
 * ============================================================================
 *
 * WHAT IT PROVES: scrolling the homepage top to bottom in small steps, no
 * headline or card belonging to one section ever visually overlaps a headline
 * or card belonging to a different section.
 *
 * WHY IT EXISTS: the site pins a section (Worlds) and moves its cards
 * sideways. A pinned element is `position: fixed` for the duration of the pin,
 * and ScrollTrigger reserves the space it vacated by growing a generated
 * `.pin-spacer`. Anything that stops that spacer from growing — a fixed height
 * on an ancestor, an `overflow` that clips it, a measurement taken before the
 * display font loaded — lets the pinned content sit on top of the next section
 * instead of above it. That failure is invisible to a build, to type-checking,
 * and to any single screenshot; it only exists mid-scroll. So it gets a test.
 *
 * RUN:  npm run test:scroll            (server must already be serving BASE)
 *       node test/scroll-integrity.mjs http://localhost:3000
 *
 * Playwright is resolved at run time rather than declared as a dependency, so
 * this file adds nothing to the install. Point PLAYWRIGHT_MODULE at it if it
 * lives somewhere unusual.
 */

import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";

const require = createRequire(import.meta.url);

function loadChromium() {
  const candidates = [
    process.env.PLAYWRIGHT_MODULE,
    "playwright",
    "/opt/node22/lib/node_modules/playwright",
  ].filter(Boolean);
  for (const c of candidates) {
    try {
      return require(c).chromium;
    } catch {
      /* try the next one */
    }
  }
  console.error(
    "Playwright not found. Install it (npm i -D playwright) or set " +
      "PLAYWRIGHT_MODULE to the package path."
  );
  process.exit(2);
}

const BASE = process.argv[2] || process.env.BASE_URL || "http://localhost:3000";
const SHOTS = process.env.SCROLL_SHOTS || "/tmp/scroll-integrity";

/** How far to move between samples. Small enough to catch a transient. */
const STEP = 140;
/**
 * Rectangles sharing only an edge are not a bug — sections butt up against each
 * other by design. Only a real shared area counts.
 */
const MIN_OVERLAP_AREA = 240;

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844, isMobile: true, hasTouch: true },
];

/**
 * Collect every element carrying a section's identity — its headline and its
 * cards — tagged with the section it belongs to. Runs in the page.
 */
const COLLECT = () => {
  const sections = [...document.querySelectorAll("main section")];
  const out = [];
  sections.forEach((section, si) => {
    const label =
      section.querySelector("h1, h2")?.innerText?.trim().slice(0, 40) || `section ${si}`;
    const parts = [
      ...section.querySelectorAll("h1, h2"),
      ...section.querySelectorAll("article"),
    ];
    for (const el of parts) {
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      // Off-screen elements cannot visually collide with anything.
      if (r.bottom <= 0 || r.top >= window.innerHeight) continue;
      // Walk up for effectively-zero opacity: a reveal that has not fired yet
      // is in the DOM but invisible, and must not count as a collision.
      let o = 1;
      for (let n = el; n && n !== document.body; n = n.parentElement) {
        const cs = getComputedStyle(n);
        o *= parseFloat(cs.opacity || "1");
        if (cs.visibility === "hidden") o = 0;
      }
      if (o <= 0.02) continue;
      out.push({
        section: si,
        label,
        text: (el.innerText || "").trim().slice(0, 34).replace(/\s+/g, " "),
        x: r.x, y: r.y, w: r.width, h: r.height,
      });
    }
  });
  return out;
};

function overlapArea(a, b) {
  const x = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const y = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return x > 0 && y > 0 ? x * y : 0;
}

async function sweep(browser, viewport, reduced) {
  const mode = `${viewport.name}/${reduced ? "reduced" : "normal"}`;
  const ctx = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.isMobile,
    hasTouch: viewport.hasTouch,
    ...(reduced ? { reducedMotion: "reduce" } : {}),
  });
  // The preloader is choreography; it must not eat the first samples.
  await ctx.addInitScript(() => sessionStorage.setItem("agentmint.struck", "1"));

  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  // Let fonts settle and any load-time refresh land before measuring.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1600);

  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const steps = Math.ceil((height - viewport.height) / STEP);
  const failures = [];

  for (let i = 0; i <= steps; i++) {
    const y = i * STEP;
    await page.evaluate((to) => window.scrollTo(0, to), y);
    // Scrubbed timelines are driven by rAF; give them a couple of frames.
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    );
    await page.waitForTimeout(70);

    const boxes = await page.evaluate(COLLECT);
    const hits = [];
    for (let a = 0; a < boxes.length; a++) {
      for (let b = a + 1; b < boxes.length; b++) {
        if (boxes[a].section === boxes[b].section) continue;
        const area = overlapArea(boxes[a], boxes[b]);
        if (area >= MIN_OVERLAP_AREA) hits.push({ a: boxes[a], b: boxes[b], area });
      }
    }
    if (hits.length) {
      failures.push({ step: i, y, hits });
      if (failures.length <= 6) {
        mkdirSync(SHOTS, { recursive: true });
        await page.screenshot({
          path: `${SHOTS}/${mode.replace("/", "-")}-step${String(i).padStart(3, "0")}-y${y}.png`,
        });
      }
    }
  }

  await ctx.close();
  return { mode, steps: steps + 1, failures, errors };
}

const chromium = loadChromium();
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});

let bad = 0;
for (const viewport of VIEWPORTS) {
  for (const reduced of [false, true]) {
    const r = await sweep(browser, viewport, reduced);
    const ok = r.failures.length === 0 && r.errors.length === 0;
    if (!ok) bad++;
    console.log(
      `${ok ? "PASS" : "FAIL"}  ${r.mode.padEnd(17)} ${r.steps} steps, ` +
        `${r.failures.length} overlapping, ${r.errors.length} console errors`
    );
    for (const f of r.failures.slice(0, 8)) {
      const h = f.hits[0];
      console.log(
        `        step ${String(f.step).padStart(3)} (y=${String(f.y).padStart(5)}): ` +
          `"${h.a.text}" [${h.a.label}] over "${h.b.text}" [${h.b.label}] — ${Math.round(h.area)}px²`
      );
    }
    if (r.failures.length > 8) {
      console.log(`        …and ${r.failures.length - 8} more steps`);
    }
    r.errors.slice(0, 3).forEach((e) => console.log(`        console: ${e}`));
  }
}

await browser.close();
console.log(
  bad === 0 ? "\nSCROLL INTEGRITY: CLEAN" : `\nSCROLL INTEGRITY: ${bad} COMBINATION(S) FAILED`
);
process.exit(bad === 0 ? 0 : 1);
