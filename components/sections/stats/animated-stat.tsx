"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import type { Stat } from "@/types/content";
import { EASE, DURATION } from "@/lib/gsap/tokens";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function AnimatedStat({ stat }: { stat: Stat }) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const node = valueRef.current;
      if (!node) return;

      if (reducedMotion) {
        node.textContent = `${stat.value.toLocaleString()}${stat.suffix ?? ""}`;
        return;
      }

      const counter = { value: 0 };
      gsap.to(counter, {
        value: stat.value,
        duration: DURATION.slow,
        ease: EASE.standard,
        scrollTrigger: { trigger: node, start: "top 85%", once: true },
        onUpdate: () => {
          node.textContent = `${Math.round(counter.value).toLocaleString()}${stat.suffix ?? ""}`;
        },
      });
    },
    { scope: valueRef, dependencies: [reducedMotion, stat.value, stat.suffix] }
  );

  return (
    <div data-stat-block className="border-t border-border pt-8">
      <span
        ref={valueRef}
        className="block font-display text-display leading-none text-foreground"
      >
        0
      </span>
      <span className="mt-3 block text-caption uppercase tracking-widest text-muted-foreground">
        {stat.label}
      </span>
    </div>
  );
}
