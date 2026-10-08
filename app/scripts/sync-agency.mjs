/**
 * ============================================================================
 * SYNC THE AGENCY — gather every agent from msitarzewski/agency-agents
 * ============================================================================
 *
 * The Agency is an MIT-licensed roster of ~280 specialist agent personas, one
 * Markdown file each, grouped into divisions. This script reads that repository
 * and writes a single data file, lib/agency/agents.json, that the dashboard at
 * /agency renders. Nothing in the app reads the upstream repo at run time.
 *
 * RUN:  npm run sync:agency                      (clones a shallow copy itself)
 *       npm run sync:agency -- --source ../path   (use a checkout you already have)
 *
 * WHAT IT READS
 *   divisions.json          the division list and labels (upstream source of truth)
 *   <division>/**\/*.md     one agent per file, YAML frontmatter + Markdown body
 *   strategy/runbooks.json  the four scenario teams, as rosters of agent slugs
 *
 * WHAT IT WRITES — per agent
 *   slug         the file stem, e.g. "engineering-frontend-developer". This is
 *                the id the upstream runbooks use, so it is the id here too.
 *   division     the top-level directory; group is the second level when there
 *                is one (game-development/unity → "unity").
 *   name, description, vibe, tools, author, services — from the frontmatter.
 *   emoji, color — kept for fidelity to the upstream file. They are NOT rendered:
 *                the house rules ban emoji on sight and allow colour only from
 *                lib/design/tokens.ts.
 *   headings     the body's `##` sections, with their emoji stripped — what the
 *                spec covers, without shipping the spec.
 *   words        body length, as a rough measure of how deep the spec goes.
 *   path         the repo-relative path; lib/agency/index.ts derives the GitHub
 *                URL from it rather than shipping 282 copies of the prefix.
 *
 * The frontmatter parser deliberately mirrors upstream's scripts/lib.sh: quoted
 * scalars lose their quotes, plain scalars fold indented continuation lines, a
 * fenced code block closes only on a fence of the same character and at least
 * the same length, and only the first occurrence of a key counts. The
 * repository is untrusted input — it is only ever read as text here, never
 * executed, and symbolic links inside it are not followed.
 *
 * Exit codes: 0 wrote the file; 1 refused to (no agents, duplicate slugs);
 * 2 bad arguments.
 */

import { execFileSync } from "node:child_process";
import { lstatSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = "msitarzewski/agency-agents";
const REPO_URL = `https://github.com/${REPO}.git`;
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, "../lib/agency/agents.json");

// ---------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
function flag(name) {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  const v = args[i + 1];
  if (v === undefined || v.startsWith("--")) {
    console.error(`${name} needs a value`);
    process.exit(2);
  }
  return v;
}
const sourceArg = flag("--source");
const outArg = flag("--out");
for (const a of args) {
  if (a.startsWith("--") && a !== "--source" && a !== "--out") {
    console.error(`unknown flag ${a}`);
    process.exit(2);
  }
}

// ---------------------------------------------------------------------------
// Frontmatter — a YAML subset, matching what the agent files actually use
// ---------------------------------------------------------------------------

/** Strip one pair of matching outer quotes and unescape, as YAML would. */
function unquote(v) {
  v = v.trim();
  if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) {
    return v.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  if (v.length >= 2 && v.startsWith("'") && v.endsWith("'")) {
    return v.slice(1, -1).replace(/''/g, "'");
  }
  return v;
}

/**
 * Parse the block between the first two `---` fences.
 * Returns { data, bodyStart, lines }, { unclosed: true } when the opening fence
 * never closes, or null when the file has no frontmatter at all.
 *
 * Supported shapes (everything the 282 files use):
 *   key: scalar                      quoted or plain; plain may fold onto
 *                                    indented continuation lines
 *   key:                             followed by `- item` lines (a list), or
 *     - name: x                      `- key: v` + indented `key: v` (a list of maps)
 *       url: y
 */
function parseFrontmatter(text) {
  const lines = text.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return null;
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) return { unclosed: true };

  const data = {};
  let i = 1;
  while (i < end) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) {
      i++;
      continue;
    }
    const m = /^([A-Za-z_][\w-]*):(.*)$/.exec(line);
    if (!m) {
      // Stray line that is not `key: value` — upstream tolerates these; so do we.
      i++;
      continue;
    }
    const key = m[1];
    const rest = m[2];
    i++;

    if (rest.trim() === "") {
      // Block value: a list, a list of maps, or nothing.
      const items = [];
      while (i < end && /^\s+\S/.test(lines[i])) {
        const l = lines[i];
        const li = /^\s+-\s*(.*)$/.exec(l);
        if (li) {
          const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(li[1]);
          if (kv) {
            // `- key: value`, then more `key: value` at a deeper indent.
            const obj = { [kv[1]]: unquote(kv[2]) };
            i++;
            while (i < end && /^\s+[A-Za-z_][\w-]*:\s*/.test(lines[i]) && !/^\s+-/.test(lines[i])) {
              const kv2 = /^\s+([A-Za-z_][\w-]*):\s*(.*)$/.exec(lines[i]);
              if (kv2) obj[kv2[1]] = unquote(kv2[2]);
              i++;
            }
            items.push(obj);
            continue;
          }
          items.push(unquote(li[1]));
          i++;
          continue;
        }
        // Indented plain text under an empty key: treat as a folded scalar.
        items.push(l.trim());
        i++;
      }
      if (!(key in data)) data[key] = items;
      continue;
    }

    // A scalar. Plain scalars fold indented continuation lines, as upstream's
    // get_field does. A quoted scalar is one line unless its closing quote is
    // missing from that line, in which case indented lines complete it.
    let value = rest;
    const t = rest.trim();
    const q = t[0] === '"' || t[0] === "'" ? t[0] : null;
    const closedOnLine = q !== null && t.length > 1 && t.endsWith(q);
    if (q === null || !closedOnLine) {
      while (i < end && /^[ \t]+\S/.test(lines[i]) && !/^[ \t]+-\s/.test(lines[i])) {
        value += " " + lines[i].trim();
        i++;
        if (q !== null && value.trimEnd().endsWith(q)) break;
      }
    }
    if (!(key in data)) data[key] = unquote(value);
  }
  return { data, bodyStart: end + 1, lines };
}

// ---------------------------------------------------------------------------
// Text hygiene
// ---------------------------------------------------------------------------

/**
 * Remove emoji from text that will be rendered. The house style bans emoji;
 * upstream uses them liberally in headings.
 *
 * `Extended_Pictographic` alone is too wide — it also covers ©, ®, ™ and the
 * arrows (↔, ↩), which are punctuation in running text. So a character is
 * removed when it is pictographic AND sits at U+2600 or above (the symbol and
 * emoji blocks), or when it is explicitly given emoji presentation with U+FE0F.
 * Variation selectors, zero-width joiners, keycap combiners and regional
 * indicators go with them so nothing is left dangling. GitHub-style
 * `:shortcode:` emoji are text, so they get their own pattern.
 */
const EMOJI =
  /(?:(?=\p{Extended_Pictographic})[\u2600-\u{10FFFF}]|\p{Extended_Pictographic}\uFE0F|\p{Regional_Indicator})[\uFE0F\u20E3]?|[\u200D\uFE0F\u20E3]/gu;
const SHORTCODE = /:(?=[a-z0-9_+-]*[a-z])[a-z0-9_+-]{2,}:/g;
/** C0 and C1 control characters, which only ever arrive by corruption. */
const CONTROL = /[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g;

function deEmoji(s) {
  return s
    .replace(EMOJI, "")
    .replace(SHORTCODE, "")
    .replace(CONTROL, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Two upstream files carry the wreckage of a bad encoding round-trip: each
 * heading emoji became `<`, `=` or `>` followed by one Latin-1 character (the
 * low bytes of its UTF-16 surrogate pair). It is unmistakable at the start of
 * a heading, so it is removed there and reported, never published.
 */
const MOJIBAKE = /^[<=>][\u0000-\u00FF](?=\s)/;

/** `## 🧠 Your \& Memory` → "Your & Memory": emoji gone, escapes undone. */
function cleanHeading(raw) {
  let h = raw;
  const mojibake = MOJIBAKE.test(h);
  if (mojibake) h = h.replace(MOJIBAKE, "");
  h = deEmoji(h)
    .replace(/\\([\\`*_{}[\]()#+\-.!&<>|~])/g, "$1")
    .replace(/^[\s:—–-]+/, "")
    .trim();
  return { heading: h, mojibake };
}

/** `tools:` arrives as "A, B, C" in most files and as a YAML list in a few. */
function toList(v) {
  if (Array.isArray(v)) return v.map((x) => (typeof x === "string" ? deEmoji(x) : "")).filter(Boolean);
  if (typeof v === "string") return v.split(",").map((x) => deEmoji(x)).filter(Boolean);
  return [];
}

function str(v) {
  return typeof v === "string" ? deEmoji(v) : "";
}

// ---------------------------------------------------------------------------
// Walk the repository
// ---------------------------------------------------------------------------

/** Every .md under dir. Symbolic links are skipped: the checkout is untrusted. */
function walk(dir, out, skipped) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = lstatSync(p);
    if (st.isSymbolicLink()) {
      skipped.push(p);
      continue;
    }
    if (st.isDirectory()) walk(p, out, skipped);
    else if (st.isFile() && entry.endsWith(".md")) out.push(p);
  }
  return out;
}

function git(root, ...a) {
  return execFileSync("git", ["-C", root, ...a], { encoding: "utf8" }).trim();
}

/** Upstream's commit — only when `root` really is the upstream checkout. */
function upstreamCommit(root) {
  try {
    const top = resolve(git(root, "rev-parse", "--show-toplevel"));
    if (top !== resolve(root)) return { commit: null, commitDate: null };
    return { commit: git(root, "rev-parse", "HEAD"), commitDate: git(root, "log", "-1", "--format=%cI") };
  } catch {
    return { commit: null, commitDate: null };
  }
}

// Fenced code, as upstream's fence_open_p / fence_closes_p read it: a fence
// opens with 3+ backticks or tildes after 0–3 spaces, and closes only on the
// same character, a run at least as long, and nothing but whitespace after.
function fenceOpen(line) {
  const m = /^ {0,3}(`{3,}|~{3,})/.exec(line);
  return m ? { char: m[1][0], len: m[1].length } : null;
}
function fenceCloses(line, open) {
  const m = /^ {0,3}(`{3,}|~{3,})[ \t]*$/.exec(line);
  return !!m && m[1][0] === open.char && m[1].length >= open.len;
}

function main() {
  let root = sourceArg ? resolve(sourceArg) : null;
  let tmp = null;
  const problems = [];

  try {
    if (!root) {
      tmp = mkdtempSync(join(tmpdir(), "agency-agents-"));
      console.log(`Cloning ${REPO_URL} (shallow) …`);
      execFileSync("git", ["clone", "--depth", "1", "--quiet", REPO_URL, tmp], { stdio: "inherit" });
      root = tmp;
    }

    const divisionsFile = JSON.parse(readFileSync(join(root, "divisions.json"), "utf8"));
    const divisionIds = Object.keys(divisionsFile.divisions);
    const { commit, commitDate } = upstreamCommit(root);
    if (!commit) problems.push("source is not a git checkout of upstream, so meta.commit is null");

    const agents = [];

    for (const division of divisionIds) {
      const dir = join(root, division);
      let files;
      const skipped = [];
      try {
        files = walk(dir, [], skipped).sort();
      } catch {
        problems.push(`division "${division}" is listed in divisions.json but has no directory`);
        continue;
      }
      for (const s of skipped) problems.push(`skipped symbolic link ${relative(root, s)}`);

      for (const file of files) {
        const relPath = relative(root, file).split("\\").join("/");
        const text = readFileSync(file, "utf8");
        const fm = parseFrontmatter(text);
        if (!fm) continue; // not an agent file (upstream's own rule: agents start with ---)
        if (fm.unclosed) {
          problems.push(`${relPath}: frontmatter never closes — skipped`);
          continue;
        }
        const { data, bodyStart, lines } = fm;
        const slug = basename(file, ".md");
        const name = str(data.name);
        const description = str(data.description);
        if (!name || !description) {
          problems.push(`${relPath}: missing name or description — skipped`);
          continue;
        }

        const body = lines.slice(bodyStart);
        const headings = [];
        let open = null;
        let mojibake = false;
        for (const l of body) {
          if (open) {
            if (fenceCloses(l, open)) open = null;
            continue;
          }
          const o = fenceOpen(l);
          if (o) {
            open = o;
            continue;
          }
          const h = /^##\s+(.+?)\s*$/.exec(l);
          if (h) {
            const c = cleanHeading(h[1]);
            if (c.mojibake) mojibake = true;
            if (c.heading && !headings.includes(c.heading)) headings.push(c.heading);
          }
        }
        if (mojibake) problems.push(`${relPath}: headings carry corrupted emoji bytes upstream — stripped`);
        const words = body.join("\n").split(/\s+/).filter(Boolean).length;

        const parts = relPath.split("/");
        const group = parts.length > 2 ? parts[1] : null;

        agents.push({
          slug,
          name,
          division,
          group,
          description,
          vibe: str(data.vibe),
          tools: toList(data.tools),
          author: typeof data.author === "string" ? deEmoji(data.author) || null : null,
          services: Array.isArray(data.services)
            ? data.services
                .filter((s) => s && typeof s === "object" && typeof s.name === "string")
                .map((s) => ({
                  name: deEmoji(s.name),
                  url: typeof s.url === "string" ? s.url.trim() : null,
                  tier: typeof s.tier === "string" ? deEmoji(s.tier) : null,
                }))
            : [],
          emoji: typeof data.emoji === "string" ? data.emoji.trim() : "",
          color: typeof data.color === "string" ? data.color.trim() : "",
          headings,
          words,
          path: relPath,
        });
      }
    }

    // Slugs are the id everywhere downstream — React keys, lookups, deep links.
    // A collision is not a note, it is a reason not to write the file.
    const seen = new Map();
    let collisions = 0;
    for (const a of agents) {
      if (seen.has(a.slug)) {
        collisions++;
        console.error(`duplicate slug "${a.slug}": ${seen.get(a.slug)} and ${a.path}`);
      }
      seen.set(a.slug, a.path);
    }
    if (collisions) {
      console.error(`${collisions} duplicate slug(s). Refusing to write.`);
      process.exit(1);
    }
    if (agents.length === 0) {
      console.error("No agents found. Refusing to write an empty file.");
      process.exit(1);
    }

    // Divisions, with counts, in upstream's order.
    const divisions = divisionIds
      .map((id) => ({
        id,
        label: deEmoji(String(divisionsFile.divisions[id]?.label ?? id)),
        count: agents.filter((a) => a.division === id).length,
      }))
      .filter((d) => d.count > 0);

    // Runbooks — the teams upstream assembles from this roster.
    let runbooks = [];
    try {
      const rb = JSON.parse(readFileSync(join(root, "strategy/runbooks.json"), "utf8"));
      runbooks = (rb.runbooks ?? []).map((r) => ({
        slug: String(r.slug ?? ""),
        title: str(r.title),
        mode: str(r.mode),
        duration: str(r.duration),
        summary: str(r.summary),
        doc: typeof r.doc === "string" ? r.doc : null,
        roster: (r.roster ?? []).map((g) => ({
          group: str(g.group),
          activation: typeof g.activation === "string" ? deEmoji(g.activation) || null : null,
          agents: (g.agents ?? []).filter((s) => {
            if (seen.has(s)) return true;
            problems.push(`runbook "${r.slug}" names unknown agent "${s}" — dropped`);
            return false;
          }),
        })),
      }));
    } catch {
      problems.push("strategy/runbooks.json not found or unreadable — runbooks left empty");
    }

    const out = {
      meta: {
        repo: REPO,
        repoUrl: `https://github.com/${REPO}`,
        license: "MIT",
        commit,
        commitDate,
        syncedAt: new Date().toISOString(),
        agentCount: agents.length,
        divisionCount: divisions.length,
      },
      divisions,
      agents,
      runbooks,
    };

    const dest = outArg ? resolve(outArg) : OUT;
    writeFileSync(dest, JSON.stringify(out, null, 2) + "\n");

    console.log(`Wrote ${relative(process.cwd(), dest)}`);
    console.log(`  ${agents.length} agents across ${divisions.length} divisions, ${runbooks.length} runbooks`);
    if (commit) console.log(`  upstream ${commit.slice(0, 7)} (${commitDate})`);
    for (const d of divisions) console.log(`  ${d.count.toString().padStart(3)}  ${d.label}`);
    if (problems.length) {
      console.log(`\n${problems.length} note(s):`);
      for (const p of problems) console.log(`  - ${p}`);
    }
  } finally {
    if (tmp) rmSync(tmp, { recursive: true, force: true });
  }
}

main();
