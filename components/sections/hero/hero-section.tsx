"use client";

import { HeroCanvas } from "@/three/hero-scene/hero-canvas";
import { HeroCopy } from "./hero-copy";
import { HeroScrollCue } from "./hero-scroll-cue";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function HeroSection() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="hero" className="relative h-[150vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-background">
        {!reducedMotion && <HeroCanvas triggerSelector="#hero" />}
        <div className="relative z-10 flex h-full flex-col justify-between px-6 py-10 md:px-12">
          <HeroCopy />
          <HeroScrollCue />
        </div>
      </div>
    </section>
  );
}
