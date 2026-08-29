"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { programs } from "@/lib/data/programs";
import { SectionHeading } from "@/components/common/section-heading";
import { ProgramCard } from "./program-card";
import { EASE, DURATION } from "@/lib/gsap/tokens";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function ProgramsSection() {
  const gridRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;

      gsap.fromTo(
        "[data-program-card]",
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: DURATION.base,
          ease: EASE.entrance,
          stagger: 0.12,
          scrollTrigger: { trigger: gridRef.current, start: "top 80%" },
        }
      );
    },
    { scope: gridRef, dependencies: [reducedMotion] }
  );

  return (
    <section id="programs" className="bg-background px-6 py-24 md:px-12">
      <SectionHeading kicker="Programs" title="Built To Progress" />
      <div ref={gridRef} className="mt-16 grid gap-6 md:grid-cols-2">
        {programs.map((program, index) => (
          <ProgramCard key={program.id} program={program} index={index} />
        ))}
      </div>
    </section>
  );
}
