import type { Metadata } from "next";
import { AgencyDashboard } from "@/components/agency/AgencyDashboard";
import { META } from "@/lib/agency";

export const metadata: Metadata = {
  title: "The Agency — every agent on one plate | AgentMint",
  description: `${META.agentCount} specialist AI agent personas from the open-source Agency roster, gathered into one dashboard. Search, filter by division, and mint any of them.`,
};

/**
 * /agency — the dashboard of the open-source Agency roster.
 * All of the data is static (lib/agency/agents.json), so this page prerenders;
 * the dashboard itself is a client component for search, filters and the panel.
 */
export default function AgencyPage() {
  return <AgencyDashboard />;
}
