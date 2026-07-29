/**
 * ============================================================================
 * THE GUILLOCHÉ ENGINE
 * ============================================================================
 *
 * Guilloché is the interlaced rosette pattern engraved on banknotes, passports
 * and share certificates — the oldest visual shorthand for "this is authentic".
 * Mathematically each curve is a hypotrochoid: a point on a small circle rolling
 * inside a larger one.
 *
 * Why this matters for AgentMint: every agent's pattern is derived from a hash
 * of its own description, so a given set of words always produces the same
 * unique engraving. The seal is not decoration next to the product — it is the
 * product's output, made visible.
 *
 * Everything here is pure arithmetic: no images, no models, no downloaded
 * assets. The entire "asset pipeline" is a few hundred bytes of code.
 */

/** FNV-1a — small, fast, well-distributed. Same text always yields same seed. */
export function seedFrom(text: string): number {
  let h = 2166136261;
  const s = text.trim().toLowerCase() || "agentmint";
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface GuillocheParams {
  /** How many nested rosette rings. */
  layers: number;
  /** Outer radius as a fraction of the available half-size. */
  R: number;
  /**
   * Lobes per ring. Real engine-turned guilloché is dense and regular — high
   * lobe counts are what separate authentic lacework from loose spirograph
   * scribble.
   */
  lobes: number;
  /** Pen offset as a fraction of the rolling circle: petal depth. */
  depth: number;
  /** Starting rotation, so two similar seeds don't look aligned. */
  twist: number;
}

/**
 * Read one byte out of the seed and map it into a range.
 *
 * Deliberately a module-level function taking `seed` explicitly rather than an
 * arrow function closing over it: the production minifier inlines the latter
 * incorrectly, dropping the captured binding for every call after the first
 * (`ReferenceError: seed is not defined` at runtime, with a clean build).
 */
function band(seed: number, shift: number, lo: number, hi: number): number {
  return lo + (((seed >>> shift) & 0xff) / 255) * (hi - lo);
}

/** Derive stable, well-spread parameters from a seed. */
export function paramsFromSeed(seed: number): GuillocheParams {
  return {
    layers: Math.round(band(seed, 0, 3, 5)),
    R: band(seed, 4, 0.68, 0.84),
    lobes: Math.round(band(seed, 8, 22, 46)),
    depth: band(seed, 12, 0.62, 1.28),
    twist: band(seed, 16, 0, Math.PI * 2),
  };
}

export function paramsFromText(text: string): GuillocheParams {
  return paramsFromSeed(seedFrom(text));
}

interface RosetteOptions {
  cx: number;
  cy: number;
  size: number;
  params: GuillocheParams;
  layer: number;
  alpha: number;
  colour: string;
  lineWidth: number;
  /** Resolution of the traced curve. Lower on weak devices. */
  steps?: number;
}

/**
 * Trace one rosette ring.
 *
 * Parameterised by lobe count rather than by an arbitrary radius ratio: with
 * r = R/N the curve closes after exactly one revolution and lays down N even
 * petals. That is what engine-turning machines actually produce, and it is the
 * difference between a banknote rosette and a tangle.
 */
export function strokeRosette(ctx: CanvasRenderingContext2D, o: RosetteOptions): void {
  const { cx, cy, size, params: p, layer } = o;

  const R = size * p.R * (1 - layer * 0.135);
  // Inner rings carry a few less lobes, so the nest reads as deliberate.
  const N = Math.max(9, p.lobes - layer * 4);
  const r = R / N;
  const d = r * p.depth;
  const k = N - 1;
  const rot = p.twist + (layer * Math.PI) / N;

  // Enough samples to keep each petal smooth, capped for weak devices.
  const steps = Math.min(o.steps ?? 2600, N * 64);

  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2 + rot;
    const x = cx + (R - r) * Math.cos(a) + d * Math.cos(k * a);
    const y = cy + (R - r) * Math.sin(a) - d * Math.sin(k * a);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.globalAlpha = o.alpha;
  ctx.strokeStyle = o.colour;
  ctx.lineWidth = o.lineWidth;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export interface SealOptions {
  /** Text the engraving is derived from. */
  text: string;
  /** Engraving colour. */
  ink?: string;
  /** Heat colour, used during a strike. */
  warm?: string;
  /** 0–1. Above 0 the seal glows brass, as if just struck. */
  heat?: number;
  /** Rotation in radians. */
  spin?: number;
  /** Draw the plate, rim and milled edge (off when used as a WebGL bump map). */
  chrome?: boolean;
  /** Curve resolution; drop for low-power devices. */
  steps?: number;
  /** Transparent background instead of the struck plate. */
  transparent?: boolean;
}

/**
 * Render a complete engraved seal into a canvas.
 * Used three ways: the 2D fallback tier, every agent card's mark, and — with
 * `chrome: false` — as the relief map driving the WebGL disc.
 */
export function drawSeal(canvas: HTMLCanvasElement, options: SealOptions): void {
  const o: Required<SealOptions> = {
    ink: "#F4560D",
    warm: "#C08A2E",
    heat: 0,
    spin: 0,
    chrome: true,
    steps: 1400,
    transparent: false,
    ...options,
  };

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const size = Math.min(w, h) / 2;
  const p = paramsFromText(o.text);

  ctx.clearRect(0, 0, w, h);

  if (o.chrome && !o.transparent) {
    // Struck plate: off-centre light source gives the metal its form.
    const plate = ctx.createRadialGradient(
      cx - size * 0.3,
      cy - size * 0.35,
      size * 0.1,
      cx,
      cy,
      size
    );
    plate.addColorStop(0, "#FFFFFF");
    plate.addColorStop(0.55, "#FFF3E4");
    plate.addColorStop(1, "#F6E3CF");
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.93, 0, Math.PI * 2);
    ctx.fillStyle = plate;
    ctx.fill();
  } else if (!o.chrome) {
    // Relief map: black is the flat plate, white lines are the raised
    // engraving. Maximum contrast — a bump map with soft greys reads as mud.
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);
  }

  // The engraving itself.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(o.spin);
  ctx.translate(-cx, -cy);

  // Line weight has a floor: below ~1px a stroke renders sub-pixel and the
  // engraving disappears entirely at card size. Relief lines are heavier
  // still — in a bump map, hairlines vanish into the surface.
  const lw = o.chrome ? Math.max(1.1, size * 0.005) : size * 0.009;
  for (let L = 0; L < p.layers; L++) {
    const warm = o.heat > 0 && L < 2;
    strokeRosette(ctx, {
      cx,
      cy,
      size,
      params: p,
      layer: L,
      alpha: o.chrome ? Math.min(1, (0.5 - L * 0.07) * (1 + o.heat)) : 1,
      colour: o.chrome ? (warm ? o.warm : o.ink) : "#ffffff",
      lineWidth: lw,
      steps: o.steps,
    });
  }
  // Inner field — a second, tighter rosette at the centre.
  for (let L = 0; L < 2; L++) {
    strokeRosette(ctx, {
      cx,
      cy,
      size: size * 0.46,
      params: p,
      layer: L,
      alpha: o.chrome ? 0.34 : 1,
      colour: o.chrome ? o.ink : "#ffffff",
      lineWidth: lw,
      steps: Math.round(o.steps * 0.7),
    });
  }

  if (!o.chrome) {
    // Concentric guide rings give the relief a struck border to catch light.
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = size * 0.016;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.86, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = size * 0.008;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.8, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  if (!o.chrome) return;

  // Beveled rim.
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.93, 0, Math.PI * 2);
  ctx.strokeStyle = "#E7D0B8";
  ctx.lineWidth = size * 0.055;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.955, 0, Math.PI * 2);
  ctx.strokeStyle = "#D2B191";
  ctx.lineWidth = size * 0.02;
  ctx.stroke();

  // Rim light sweeping across the bevel — the thing that reads as metal.
  const sweep = ctx.createLinearGradient(cx - size, cy - size, cx + size, cy + size);
  sweep.addColorStop(0, "rgba(255,255,255,0)");
  sweep.addColorStop(0.42, o.heat > 0 ? "rgba(192,138,46,.95)" : "rgba(255,255,255,.9)");
  sweep.addColorStop(0.6, "rgba(255,255,255,0)");
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.93, 0, Math.PI * 2);
  ctx.strokeStyle = sweep;
  ctx.lineWidth = size * 0.045;
  ctx.stroke();

  // Milled edge — the reeding around a struck coin.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = "rgba(120,80,40,.22)";
  ctx.lineWidth = Math.max(1, size * 0.008);
  const teeth = 90;
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2 + o.spin * 0.4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * size * 0.975, Math.sin(a) * size * 0.975);
    ctx.lineTo(Math.cos(a) * size * 0.999, Math.sin(a) * size * 0.999);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * A compact engraved mark for agent cards — same maths, cheaper settings, and
 * no struck plate behind it so the engraving sits directly on the card.
 */
export function drawMark(canvas: HTMLCanvasElement, text: string, ink = "#F4560D"): void {
  drawSeal(canvas, { text, ink, chrome: true, transparent: true, steps: 900 });
}
