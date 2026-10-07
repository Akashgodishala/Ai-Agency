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
 *   sourceUrl    the file on GitHub, so the full persona is one click away.
 *
 * The frontmatter parser deliberately mirrors upstream's scripts/lib.sh: quoted
 * scalars lose their quotes, plain scalars fold indented continuation lines, and
 * only the first occurrence of a key counts. The repository is untrusted input —
 * it is only ever read as text here, never executed.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
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
  return i === -1 ? undefined : args[i + 1];
}
const sourceArg = flag("--source");
const outArg = flag("--out");

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
 * Returns { data, bodyStart } or null when the file has no frontmatter.
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
  if (end === -1) return null;

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
    let rest = m[2];
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

    // Plain scalar, folding indented continuation lines like YAML does.
    let value = rest;
    const quoted = /^\s*["']/.test(rest);
    if (!quoted) {
      while (i < end && /^[ \t]+\S/.test(lines[i]) && !/^[ \t]+-\s/.test(lines[i])) {
        value += " " + lines[i].trim();
        i++;
      }
    } else {
      // A quoted scalar can also span lines until its closing quote.
      const q = rest.trim()[0];
      while (i < end && !new RegExp(`${q}\\s*$`).test(value)) {
        value += " " + lines[i].trim();
        i++;
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
 * Remove emoji and pictographs from text that will be rendered. The house style
 * bans emoji; upstream uses them liberally in headings. Variation selectors,
 * zero-width joiners and keycap combiners are stripped with them so nothing is
 * left dangling.
 */
const EMOJI = /[\p{Extended_Pictographic}\p{Regional_Indicator}\u200D\uFE0F\u20E3]/gu;
function deEmoji(s) {
  return s.replace(EMOJI, "").replace(/\s{2,}/g, " ").trim();
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** `tools:` arrives as "A, B, C" in most files and as a YAML list in a few. */
function toList(v) {
  if (Array.isArray(v)) return v.map((x) => (typeof x === "string" ? x : "")).filter(Boolean);
  if (typeof v === "string") return v.split(",").map((x) => x.trim()).filter(Boolean);
  return [];
}

// ---------------------------------------------------------------------------
// Walk the repository
// ---------------------------------------------------------------------------

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (entry.endsWith(".md")) out.push(p);
  }
  return out;
}

function git(root, ...a) {
  return execFileSync("git", ["-C", root, ...a], { encoding: "utf8" }).trim();
}

function main() {
  let root = sourceArg ? resolve(sourceArg) : null;
  let tmp = null;
  if (!root) {
    tmp = mkdtempSync(join(tmpdir(), "agency-agents-"));
    console.log(`Cloning ${REPO_URL} (shallow) …`);
    execFileSync("git", ["clone", "--depth", "1", "--quiet", REPO_URL, tmp], { stdio: "inherit" });
    root = tmp;
  }

  try {
    const divisionsFile = JSON.parse(readFileSync(join(root, "divisions.json"), "utf8"));
    const divisionIds = Object.keys(divisionsFile.divisions);

    let commit = null;
    let commitDate = null;
    try {
      commit = git(root, "rev-parse", "HEAD");
      commitDate = git(root, "log", "-1", "--format=%cI");
    } catch {
      /* not a git checkout — fine, the data is still good */
    }

    const agents = [];
    const problems = [];

    for (const division of divisionIds) {
      const dir = join(root, division);
      let files;
      try {
        files = walk(dir).sort();
      } catch {
        problems.push(`division "${division}" is listed in divisions.json but has no directory`);
        continue;
      }
      for (const file of files) {
        const text = readFileSync(file, "utf8");
        const fm = parseFrontmatter(text);
        if (!fm) continue; // not an agent file (upstream's own rule: agents start with ---)
        const { data, bodyStart, lines } = fm;
        const relPath = relative(root, file).split("\\").join("/");
        const slug = basename(file, ".md");
        const name = typeof data.name === "string" ? deEmoji(data.name) : "";
        const description = typeof data.description === "string" ? deEmoji(data.description) : "";
        if (!name || !description) {
          problems.push(`${relPath}: missing name or description`);
          continue;
        }

        const body = lines.slice(bodyStart);
        const headings = [];
        let inFence = false;
        for (const l of body) {
          if (/^\s{0,3}(`{3,}|~{3,})/.test(l)) inFence = !inFence;
          if (inFence) continue;
          const h = /^##\s+(.+?)\s*$/.exec(l);
          if (h) {
            const clean = deEmoji(h[1]).replace(/^[\s:—–-]+/, "");
            if (clean && !headings.includes(clean)) headings.push(clean);
          }
        }
        const words = body.join("\n").split(/\s+/).filter(Boolean).length;

        const parts = relPath.split("/");
        const group = parts.length > 2 ? parts[1] : null;

        const agent = {
          slug,
          nameSlug: slugify(name),
          name,
          division,
          group,
          description,
          vibe: typeof data.vibe === "string" ? deEmoji(data.vibe) : "",
          tools: toList(data.tools),
          author: typeof data.author === "string" ? data.author.trim() : null,
          services: Array.isArray(data.services)
            ? data.services
                .filter((s) => s && typeof s === "object" && s.name)
                .map((s) => ({ name: s.name, url: s.url ?? null, tier: s.tier ?? null }))
            : [],
          emoji: typeof data.emoji === "string" ? data.emoji.trim() : "",
          color: typeof data.color === "string" ? data.color.trim() : "",
          headings,
          words,
          path: relPath,
          sourceUrl: `https://github.com/${REPO}/blob/main/${relPath}`,
        };
        agents.push(agent);
      }
    }

    // Slugs must be unique: they are the id everywhere downstream.
    const seen = new Map();
    for (const a of agents) {
      if (seen.has(a.slug)) problems.push(`duplicate slug "${a.slug}": ${seen.get(a.slug)} and ${a.path}`);
      seen.set(a.slug, a.path);
    }

    // Divisions, with counts, in upstream's order.
    const divisions = divisionIds
      .map((id) => ({
        id,
        label: divisionsFile.divisions[id].label,
        count: agents.filter((a) => a.division === id).length,
      }))
      .filter((d) => d.count > 0);

    // Runbooks — the teams upstream assembles from this roster.
    let runbooks = [];
    try {
      const rb = JSON.parse(readFileSync(join(root, "strategy/runbooks.json"), "utf8"));
      runbooks = (rb.runbooks ?? []).map((r) => ({
        slug: r.slug,
        title: deEmoji(r.title ?? ""),
        mode: r.mode ?? "",
        duration: r.duration ?? "",
        summary: deEmoji(r.summary ?? ""),
        docUrl: r.doc ? `https://github.com/${REPO}/blob/main/${r.doc}` : null,
        roster: (r.roster ?? []).map((g) => ({
          group: deEmoji(g.group ?? ""),
          activation: g.activation ?? null,
          agents: (g.agents ?? []).filter((s) => {
            if (seen.has(s)) return true;
            problems.push(`runbook "${r.slug}" names unknown agent "${s}"`);
            return false;
          }),
        })),
      }));
    } catch {
      problems.push("strategy/runbooks.json not found or unreadable — runbooks left empty");
    }

    if (agents.length === 0) {
      console.error("No agents found. Refusing to write an empty file.");
      process.exit(1);
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
