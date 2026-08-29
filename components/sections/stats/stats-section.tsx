"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { stats } from "@/lib/data/stats";
import { SectionHeading } from "@/components/common/section-heading";
import { AnimatedStat } from "./animated-stat";
import { EASE, DURATION } from "@/lib/gsap/tokens";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function StatsSection() {
  const gridRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;

      gsap.fromTo(
        "[data-stat-block]",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: DURATION.base,
          ease: EASE.entrance,
          stagger: 0.1,
          scrollTrigger: { trigger: gridRef.current, start: "top 85%" },
        }
      );
    },
    { scope: gridRef, dependencies: [reducedMotion] }
  );

  return (
    <section id="stats" className="bg-background px-6 py-24 md:px-12">
      <SectionHeading kicker="By The Numbers" title="Results, Measured" />
      <div ref={gridRef} className="mt-16 grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
        {stats.map((stat) => (
          <AnimatedStat key={stat.id} stat={stat} />
        ))}
      </div>
    </section>
  );
}
