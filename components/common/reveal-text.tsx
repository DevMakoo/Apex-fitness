"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { EASE, DURATION } from "@/lib/gsap/tokens";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type RevealTextProps = {
  lines: ReactNode[];
  as?: "p" | "h1" | "h2";
  className?: string;
  trigger?: "scroll" | "manual";
  active?: boolean;
};

export function RevealText({
  lines,
  as = "p",
  className,
  trigger = "scroll",
  active = true,
}: RevealTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  function setContainerRef(node: HTMLElement | null) {
    containerRef.current = node;
  }

  useGSAP(
    () => {
      if (trigger !== "scroll" || reducedMotion) return;

      gsap.fromTo(
        containerRef.current!.querySelectorAll("[data-reveal-line]"),
        { clipPath: "inset(0 0 100% 0)", yPercent: 30 },
        {
          clipPath: "inset(0 0 0% 0)",
          yPercent: 0,
          duration: DURATION.base,
          ease: EASE.entrance,
          stagger: 0.08,
          scrollTrigger: { trigger: containerRef.current, start: "top 80%" },
        }
      );
    },
    { scope: containerRef, dependencies: [reducedMotion] }
  );

  useGSAP(
    () => {
      if (trigger !== "manual" || !active || reducedMotion) return;

      gsap.to(containerRef.current!.querySelectorAll("[data-reveal-line]"), {
        clipPath: "inset(0 0 0% 0)",
        yPercent: 0,
        duration: DURATION.base,
        ease: EASE.entrance,
        stagger: 0.08,
      });
    },
    { scope: containerRef, dependencies: [trigger, active, reducedMotion] }
  );

  const content = lines.map((line, index) => (
    <span key={index} className="block overflow-hidden">
      <span
        data-reveal-line
        className="block"
        style={reducedMotion ? undefined : { clipPath: "inset(0 0 100% 0)", transform: "translateY(30%)" }}
      >
        {line}
      </span>
    </span>
  ));

  if (as === "h1") {
    return (
      <h1 ref={setContainerRef} className={className}>
        {content}
      </h1>
    );
  }

  if (as === "h2") {
    return (
      <h2 ref={setContainerRef} className={className}>
        {content}
      </h2>
    );
  }

  return (
    <p ref={setContainerRef} className={className}>
      {content}
    </p>
  );
}
