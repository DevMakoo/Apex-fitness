"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import type { Trainer } from "@/types/content";
import { RevealImage } from "@/components/common/reveal-image";
import { EASE, DURATION } from "@/lib/gsap/tokens";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function TrainerCard({ trainer, index }: { trainer: Trainer; index: number }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const frame = frameRef.current;
      const photo = frame?.querySelector<HTMLElement>("[data-trainer-photo]");
      const underline = frame?.querySelector<HTMLElement>("[data-trainer-underline]");
      if (!frame || !photo || !underline || reducedMotion) return;

      const handleEnter = () => {
        gsap.to(photo, { scale: 1.06, duration: DURATION.slow, ease: EASE.standard });
        gsap.to(underline, { scaleX: 1, duration: DURATION.fast, ease: EASE.standard });
      };
      const handleLeave = () => {
        gsap.to(photo, { scale: 1, duration: DURATION.slow, ease: EASE.standard });
        gsap.to(underline, { scaleX: 0, duration: DURATION.fast, ease: EASE.standard });
      };

      frame.addEventListener("pointerenter", handleEnter);
      frame.addEventListener("pointerleave", handleLeave);
      return () => {
        frame.removeEventListener("pointerenter", handleEnter);
        frame.removeEventListener("pointerleave", handleLeave);
      };
    },
    { scope: frameRef, dependencies: [reducedMotion] }
  );

  return (
    <article ref={frameRef}>
      <RevealImage className="relative aspect-[3/4] w-full overflow-hidden border border-border bg-card/40">
        <div data-trainer-photo className="relative h-full w-full">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-4 left-4 select-none font-display text-6xl leading-none text-muted-foreground/20 md:text-7xl"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <div role="img" aria-label={trainer.imageAlt} className="absolute inset-0" />
        </div>
      </RevealImage>
      <div className="relative mt-6 inline-block">
        <h3 className="font-display text-subhead uppercase leading-tight text-foreground">
          {trainer.name}
        </h3>
        <span
          data-trainer-underline
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-foreground"
        />
      </div>
      <p className="mt-1 text-caption uppercase tracking-widest text-muted-foreground">
        {trainer.role}
      </p>
      <p className="mt-3 max-w-sm text-body text-muted-foreground">{trainer.bio}</p>
    </article>
  );
}
