import type { Metadata } from "next";
import { AgencyDashboard } from "@/components/agency/AgencyDashboard";
import { META, initialKey, initialStateFrom } from "@/lib/agency";

export const metadata: Metadata = {
  title: "The Agency — every agent on one plate | AgentMint",
  description: `${META.agentCount} specialist AI agent personas from the open-source Agency roster, gathered into one dashboard. Search, filter by division, and mint any of them.`,
};

/**
 * /agency — the dashboard of the open-source Agency roster.
 *
 * The data is static (lib/agency/agents.json), but the page reads the URL's
 * search params on the server so a shared link — a division, a search, one
 * agent — renders the right view in the first paint rather than the full
 * roster followed by a jump once JavaScript arrives. Reading `searchParams`
 * is what makes the route render per request; the cost is a few
 * milliseconds against a static file.
 *
 * The dashboard is keyed on that initial state, so navigating to a different
 * /agency URL remounts it clean instead of carrying stale filters across.
 */
export default function AgencyPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const initial = initialStateFrom(searchParams);
  return <AgencyDashboard key={initialKey(initial)} initial={initial} />;
}
