"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { EASE, DURATION } from "@/lib/gsap/tokens";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type StaggerRevealProps = {
  children: ReactNode;
  className?: string;
  itemSelector: string;
  stagger?: number;
};

export function StaggerReveal({ children, className, itemSelector, stagger = 0.12 }: StaggerRevealProps) {
  const containerRef = useRef<HTMLUListElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;

      gsap.fromTo(
        itemSelector,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: DURATION.base,
          ease: EASE.entrance,
          stagger,
          scrollTrigger: { trigger: containerRef.current, start: "top 80%" },
        }
      );
    },
    { scope: containerRef, dependencies: [reducedMotion] }
  );

  return (
    <ul ref={containerRef} className={className}>
      {children}
    </ul>
  );
}
