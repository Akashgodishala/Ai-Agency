import { TEMPLATES } from "@/lib/templates";
import { Hero } from "@/components/site/Hero";
import { Process } from "@/components/site/Process";
import { Collection } from "@/components/site/Collection";

/**
 * The landing experience.
 * Pass 1 ships the hero, the three-beat process, and the collection.
 * Passes 2–4 add philosophy, agent worlds, trust, roadmap, and the final CTA.
 */
export default function Landing() {
  return (
    <>
      <span id="top" />
      <Hero agentCount={TEMPLATES.length} />
      <Process />
      <Collection />
    </>
  );
}
