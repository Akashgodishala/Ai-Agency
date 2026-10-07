"use client";

import { agentBySlug, type AgencyRunbook } from "@/lib/agency";

/**
 * The four scenario teams upstream assembles from the roster. Each chip is an
 * agent; selecting one opens its panel, so a runbook doubles as a guided tour.
 */
export function Runbooks({
  runbooks,
  onOpen,
}: {
  runbooks: readonly AgencyRunbook[];
  onOpen: (slug: string) => void;
}) {
  if (runbooks.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-px border border-rule bg-rule lg:grid-cols-2">
      {runbooks.map((r) => {
        const size = r.roster.reduce((n, g) => n + g.agents.length, 0);
        return (
          <article key={r.slug} className="flex flex-col gap-5 bg-plate p-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="assay">
                {r.mode}
                {r.duration ? ` · ${r.duration}` : ""}
              </span>
              <span className="assay text-mint">{size} agents</span>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-[1.5rem] leading-tight">{r.title}</h3>
              <p className="text-[0.93rem] leading-relaxed text-muted">{r.summary}</p>
            </div>

            <div className="flex flex-col gap-4">
              {r.roster.map((g) => (
                <div key={g.group} className="flex flex-col gap-2">
                  <p className="assay normal-case tracking-[0.08em] text-dim">
                    {g.group}
                    {g.activation ? ` · ${g.activation}` : ""}
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {g.agents.map((slug) => {
                      const a = agentBySlug(slug);
                      if (!a) return null;
                      return (
                        <li key={slug}>
                          <button
                            type="button"
                            onClick={() => onOpen(slug)}
                            className="border border-rule px-2.5 py-1 text-[0.8rem] text-muted transition-colors duration-200 ease-struck hover:border-mint hover:text-paper"
                          >
                            {a.name}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            {r.docUrl && (
              <a
                href={r.docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="assay mt-auto w-fit normal-case tracking-[0.08em] text-mint transition-colors hover:text-paper"
              >
                Read the runbook →
              </a>
            )}
          </article>
        );
      })}
    </div>
  );
}
