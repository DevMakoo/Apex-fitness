import { HeroCopy } from "./hero-copy";
import { HeroScrollCue } from "./hero-scroll-cue";

export function HeroSection() {
  return (
    <section id="hero" className="relative h-[150vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-between overflow-hidden bg-background px-6 py-10 md:px-12">
        <HeroCopy />
        <HeroScrollCue />
      </div>
    </section>
  );
}
