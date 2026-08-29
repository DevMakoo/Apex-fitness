"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { HeroCanvas } from "@/three/hero-scene/hero-canvas";
import { HeroCopy } from "./hero-copy";
import { HeroScrollCue } from "./hero-scroll-cue";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { usePreloaderComplete } from "@/components/preloader/preloader";
import { EASE, DURATION } from "@/lib/gsap/tokens";

export function HeroSection() {
  const reducedMotion = useReducedMotion();
  const preloaderComplete = usePreloaderComplete();
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!preloaderComplete || reducedMotion) return;

      gsap.fromTo(
        canvasWrapperRef.current,
        { opacity: 0 },
        { opacity: 1, duration: DURATION.slow, ease: EASE.standard, delay: 1 }
      );
    },
    { scope: canvasWrapperRef, dependencies: [preloaderComplete, reducedMotion] }
  );

  return (
    <section id="hero" className="relative h-[150vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-background">
        {!reducedMotion && (
          <div ref={canvasWrapperRef} className="absolute inset-0" style={{ opacity: 0 }}>
            <HeroCanvas triggerSelector="#hero" />
          </div>
        )}
        <div className="relative z-10 flex h-full flex-col justify-between px-6 py-10 md:px-12">
          <HeroCopy />
          <HeroScrollCue />
        </div>
      </div>
    </section>
  );
}
