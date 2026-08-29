"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { usePreloaderComplete } from "@/components/preloader/preloader";
import { RevealText } from "@/components/common/reveal-text";
import { EASE, DURATION } from "@/lib/gsap/tokens";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function HeroCopy() {
  const preloaderComplete = usePreloaderComplete();
  const reducedMotion = useReducedMotion();
  const supportingRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!preloaderComplete || reducedMotion) return;

      gsap.fromTo(
        supportingRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: DURATION.base, ease: EASE.standard, delay: 0.6 }
      );
    },
    { scope: supportingRef, dependencies: [preloaderComplete, reducedMotion] }
  );

  return (
    <div className="max-w-3xl">
      <RevealText
        as="p"
        trigger="manual"
        active={preloaderComplete}
        lines={["Est. Performance"]}
        className="text-caption uppercase tracking-widest text-muted-foreground"
      />
      <RevealText
        as="h1"
        trigger="manual"
        active={preloaderComplete}
        lines={["Train Like The", "Machine You Are"]}
        className="mt-4 font-display text-display uppercase leading-[0.9] text-foreground"
      />
      <div
        ref={supportingRef}
        className="mt-6 max-w-md"
        style={{ opacity: reducedMotion ? 1 : 0 }}
      >
        <p className="text-body text-muted-foreground">
          APEX is a performance training studio built for athletes who refuse to plateau. Precision
          programming, elite coaching, uncompromising standards.
        </p>
        <a
          href="#membership"
          className="mt-8 inline-flex items-center rounded-full bg-foreground px-6 py-3 text-sm uppercase tracking-wide text-background"
        >
          Start Training
        </a>
      </div>
    </div>
  );
}
