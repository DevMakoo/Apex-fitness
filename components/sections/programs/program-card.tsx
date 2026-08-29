"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import type { Program } from "@/types/content";
import { EASE, DURATION } from "@/lib/gsap/tokens";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function ProgramCard({ program, index }: { program: Program; index: number }) {
  const cardRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const card = cardRef.current;
      const underline = card?.querySelector("[data-card-underline]");
      if (!card || !underline || reducedMotion) return;

      const handleEnter = () => {
        gsap.to(card, { y: -6, duration: DURATION.fast, ease: EASE.standard });
        gsap.to(underline, { scaleX: 1, duration: DURATION.fast, ease: EASE.standard });
      };
      const handleLeave = () => {
        gsap.to(card, { y: 0, duration: DURATION.fast, ease: EASE.standard });
        gsap.to(underline, { scaleX: 0, duration: DURATION.fast, ease: EASE.standard });
      };

      card.addEventListener("pointerenter", handleEnter);
      card.addEventListener("pointerleave", handleLeave);
      return () => {
        card.removeEventListener("pointerenter", handleEnter);
        card.removeEventListener("pointerleave", handleLeave);
      };
    },
    { scope: cardRef, dependencies: [reducedMotion] }
  );

  return (
    <article
      ref={cardRef}
      data-program-card
      className="group relative overflow-hidden border border-border bg-card/40 p-8 transition-colors duration-300 hover:border-foreground/40 md:p-10"
    >
      <span aria-hidden="true" className="font-display text-sm text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3 className="mt-6 font-display text-subhead uppercase leading-tight text-foreground">
        {program.name}
      </h3>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-border px-3 py-1 text-caption uppercase tracking-wide text-muted-foreground">
          {program.duration}
        </span>
        <span className="rounded-full border border-border px-3 py-1 text-caption uppercase tracking-wide text-muted-foreground">
          {program.intensity}
        </span>
      </div>
      <p className="mt-6 max-w-md text-body text-muted-foreground">{program.description}</p>
      <span
        data-card-underline
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-foreground"
      />
    </article>
  );
}
