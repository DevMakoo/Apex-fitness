"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import Image from "next/image";
import { programs } from "@/lib/data/programs";
import { SectionHeading } from "@/components/common/section-heading";
import { RevealImage } from "@/components/common/reveal-image";
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
      <div className="mt-16 grid gap-10 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] md:gap-12">
        <RevealImage className="relative aspect-[3/4] w-full overflow-hidden border border-border md:aspect-auto md:h-full">
          <Image
            src="/references/programs/program-01.jpg"
            alt="Athlete silhouetted mid-deadlift, backlit through dust and directional light"
            fill
            sizes="(min-width: 768px) 62vw, 100vw"
            className="object-cover object-[50%_25%]"
          />
        </RevealImage>
        <div ref={gridRef} className="grid gap-6">
          {programs.map((program, index) => (
            <ProgramCard key={program.id} program={program} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
