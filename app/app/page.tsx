import { TEMPLATES } from "@/lib/templates";
import { Hero } from "@/components/site/Hero";
import { TheFifty } from "@/components/site/TheFifty";
import { Process } from "@/components/site/Process";
import { Statement } from "@/components/site/Statement";
import { Collection } from "@/components/site/Collection";
import { Worlds } from "@/components/site/Worlds";
import { Trust } from "@/components/site/Trust";
import { Roadmap } from "@/components/site/Roadmap";
import { FinalStrike } from "@/components/site/FinalStrike";

/**
 * The landing experience.
 *
 * The arc: strike (something is made) → understand (three beats) → believe
 * (the statement) → browse (the collection and its worlds) → trust → what's
 * coming → act. Every section earns its scroll.
 */
export default function Landing() {
  return (
    <>
      <span id="top" />
      <Hero agentCount={TEMPLATES.length} />
      <TheFifty />
      <Process />
      <Statement />
      <Collection />
      <Worlds />
      <Trust />
      <Roadmap />
      <FinalStrike />
    </>
  );
}
