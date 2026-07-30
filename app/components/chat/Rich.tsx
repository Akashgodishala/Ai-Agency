import type { ReactNode } from "react";

/**
 * The small slice of Markdown that agents actually emit.
 *
 * Models reach for tables, bullets and bold whenever they are summarising
 * money or comparing options — which is most of this catalogue. Printed raw,
 * a table is a wall of pipe characters, and the demo looks broken at exactly
 * the moment it is meant to look convincing. So: tables, bullets, numbered
 * lists, bold and inline code, and nothing else. Anything unrecognised falls
 * through as plain text, which is the correct outcome for prose.
 *
 * Deliberately not a Markdown library — this renders a fixed set of shapes
 * into elements, so there is no HTML parsing anywhere and nothing a model
 * writes can become markup.
 */

/** Bold and inline code inside a line of text. */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*(.+?)\*\*|`(.+?)`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[2] !== undefined) {
      out.push(
        <strong key={`${keyBase}-b${i}`} className="font-semibold text-paper">
          {m[2]}
        </strong>
      );
    } else {
      out.push(
        <code
          key={`${keyBase}-c${i}`}
          className="rounded bg-mint-soft px-1 py-0.5 font-mono text-[0.85em] text-mint"
        >
          {m[3]}
        </code>
      );
    }
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const cells = (row: string) =>
  row.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim());

/** A row of dashes under the header is what makes a pipe table a table. */
const isDivider = (row: string) => /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(row) && row.includes("-");

export function Rich({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ---- table: a header row, a divider, then body rows ----
    if (line.includes("|") && i + 1 < lines.length && isDivider(lines[i + 1])) {
      const head = cells(line);
      const body: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].includes("|")) {
        body.push(cells(lines[i]));
        i++;
      }
      blocks.push(
        <div key={key++} className="-mx-1 my-2 overflow-x-auto">
          <table className="w-full border-collapse text-[0.82rem]">
            <thead>
              <tr>
                {head.map((h, hi) => (
                  <th
                    key={hi}
                    className="whitespace-nowrap border-b border-line px-2.5 py-1.5 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-dim"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri} className="border-b border-line/60 last:border-0">
                  {r.map((c, ci) => (
                    <td key={ci} className="px-2.5 py-1.5 align-top tabular-nums">
                      {inline(c, `t${key}-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // ---- bulleted list ----
    if (/^\s*[-*•]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*•]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="my-1.5 space-y-1 pl-1">
          {items.map((t, ii) => (
            <li key={ii} className="flex gap-2">
              <span className="mt-[0.55em] h-1 w-1 flex-none rounded-full bg-mint" aria-hidden="true" />
              <span>{inline(t, `u${key}-${ii}`)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // ---- numbered list ----
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="my-1.5 space-y-1 pl-1">
          {items.map((t, ii) => (
            <li key={ii} className="flex gap-2">
              <span className="mt-[0.05em] flex-none font-mono text-[11px] text-mint">{ii + 1}.</span>
              <span>{inline(t, `o${key}-${ii}`)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // ---- blank line: a paragraph break, not an empty box ----
    if (line.trim() === "") {
      if (blocks.length) blocks.push(<div key={key++} className="h-2" />);
      i++;
      continue;
    }

    // ---- plain text, gathered until the next structural line ----
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^\s*[-*•]\s+/.test(lines[i]) &&
      !/^\s*\d+[.)]\s+/.test(lines[i]) &&
      !(lines[i].includes("|") && i + 1 < lines.length && isDivider(lines[i + 1]))
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="whitespace-pre-wrap">
        {inline(para.join("\n"), `p${key}`)}
      </p>
    );
  }

  return <>{blocks}</>;
}
